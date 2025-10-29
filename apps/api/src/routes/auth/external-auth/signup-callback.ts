import { Elysia, t } from "elysia";
import { newClientType } from "../../../core/domain/value-objects";
import { env } from "../../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	RedirectResponse,
	RedirectResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import {
	ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME,
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
	convertRedirectableMobileScheme,
} from "../../../core/lib/http";
import { timingSafeStringEqual } from "../../../core/lib/security";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../features/auth";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/openapi";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";

export const ExternalAuthSignupCallback = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(
		rateLimit("external-auth-signup-callback", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.get(
		"/:provider/signup/callback",
		async ({ containers, cookie, params: { provider: _provider }, query: { code, state: queryState, error }, set }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const provider = newExternalIdentityProvider(_provider);
			const signedState = cookieManager.getCookie(OAUTH_STATE_COOKIE_NAME);
			const codeVerifier = cookieManager.getCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			const redirectURI = cookieManager.getCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (!queryState || !timingSafeStringEqual(queryState, signedState)) {
				throw new BadRequestException({
					code: "INVALID_STATE",
					message: "Invalid OAuth state. Please try again.",
				});
			}

			const result = await containers.auth.externalAuthSignupCallbackUseCase.execute(
				env.APP_ENV === "production",
				error,
				redirectURI,
				provider,
				signedState,
				code,
				codeVerifier,
			);

			cookieManager.deleteCookie(OAUTH_STATE_COOKIE_NAME);
			cookieManager.deleteCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			cookieManager.deleteCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_STATE") {
					throw new BadRequestException({
						code: code,
						message: "Invalid OAuth state. Please try again.",
					});
				}
				if (code === "INVALID_REDIRECT_URI") {
					throw new BadRequestException({
						code: code,
						message: "Invalid redirect URL. Please check the URL and try again.",
					});
				}
				if (code === "TOKEN_EXCHANGE_FAILED") {
					throw new BadRequestException({
						code: code,
						message: "OAuth code is missing. Please try again.",
					});
				}
				if (code === "ACCOUNT_ASSOCIATION_AVAILABLE") {
					// Account Association Challenge Flow
					const {
						code: errorCode,
						context: { redirectURL, clientType, accountAssociationSessionToken, accountAssociationSession },
					} = result;

					if (clientType === newClientType("mobile")) {
						redirectURL.searchParams.set("account-association-session-token", accountAssociationSessionToken);
						redirectURL.searchParams.set("error", errorCode);
						set.headers["referrer-policy"] = "strict-origin";
						return RedirectResponse(convertRedirectableMobileScheme(redirectURL));
					}

					cookieManager.setCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME, accountAssociationSessionToken, {
						expires: accountAssociationSession.expiresAt,
					});

					redirectURL.searchParams.set("error", errorCode);
					return RedirectResponse(redirectURL.toString());
				}
				// If there is an error, add the error to the redirect URL and redirect
				const {
					code: errorCode,
					context: { redirectURL },
				} = result;

				redirectURL.searchParams.set("error", errorCode);
				return RedirectResponse(redirectURL.toString());
			}

			const { session, sessionToken, redirectURL, clientType } = result.value;

			if (clientType === "mobile") {
				redirectURL.searchParams.set("access-token", sessionToken);
				set.headers["referrer-policy"] = "strict-origin";
				return RedirectResponse(convertRedirectableMobileScheme(redirectURL));
			}

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return RedirectResponse(redirectURI.toString());
		},
		{
			beforeHandle: async ({ rateLimit, ip }) => {
				await rateLimit.consume(ip, 1);
			},
			query: t.Object(
				{
					code: t.Optional(
						t.String({
							minLength: 1,
						}),
					),
					state: t.Optional(
						t.String({
							minLength: 1,
						}),
					),
					error: t.Optional(t.String()),
				},
				{ additionalProperties: true },
			),
			params: t.Object({
				provider: externalIdentityProviderSchema,
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_STATE_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				302: RedirectResponseSchema,
				400: ResponseTUnion(
					ErrorResponseSchema("INVALID_STATE"),
					ErrorResponseSchema("INVALID_REDIRECT_URI"),
					ErrorResponseSchema("TOKEN_EXCHANGE_FAILED"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-external-auth-signup-callback",
				summary: "External Auth Signup Callback",
				description: [
					"External Auth Signup Callback for the provider",
					"##### **Error Query**",
					"---",
					"- **PROVIDER_ACCESS_DENIED**",
					"- **PROVIDER_ERROR**",
					"- **GET_IDENTITY_FAILED**",
					"- **ACCOUNT_ALREADY_REGISTERED**",
					"- **ACCOUNT_ASSOCIATION_AVAILABLE**",
				],
				tag: "Auth - External Auth",
			}),
		},
	);
