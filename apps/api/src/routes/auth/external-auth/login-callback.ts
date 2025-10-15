import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { ExternalAuthLoginCallbackUseCase, oauthStateSchema } from "../../../application/use-cases/external-auth";
import {
	ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME,
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../../common/constants";
import { convertRedirectableMobileScheme, timingSafeStringEqual } from "../../../common/utils";
import {
	externalIdentityProviderSchema,
	newClientType,
	newExternalIdentityProvider,
} from "../../../domain/value-objects";
import { HmacOAuthStateSigner, SessionSecretHasher } from "../../../infrastructure/crypto";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { createOAuthGateway } from "../../../interface-adapter/gateways/oauth-provider";
import { CookieManager } from "../../../interface-adapter/http/cookie";
import { AccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import { ExternalIdentityRepository } from "../../../interface-adapter/repositories/external-identity";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	RedirectResponse,
	RedirectResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../modules/elysia-with-env";
import { BadRequestException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";

export const ExternalAuthLoginCallback = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimit("external-auth-login-callback", {
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
		"/:provider/login/callback",
		async ({
			env: {
				APP_ENV,
				DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				OAUTH_STATE_HMAC_SECRET,
			},
			cfModuleEnv: { DB },
			cookie,
			params: { provider: _provider },
			query: { code, state: queryState, error },
			set,
		}) => {
			// === Instances ===
			const provider = newExternalIdentityProvider(_provider);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/login/callback`, apiBaseURL);

			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);
			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
			const oauthProviderGateway = createOAuthGateway(
				{
					DISCORD_CLIENT_ID,
					DISCORD_CLIENT_SECRET,
					GOOGLE_CLIENT_ID,
					GOOGLE_CLIENT_SECRET,
				},
				provider,
				providerRedirectURL.toString(),
			);

			const sessionSecretHasher = new SessionSecretHasher();
			const oauthStateSigner = new HmacOAuthStateSigner(OAUTH_STATE_HMAC_SECRET, oauthStateSchema);

			const externalAuthLoginCallbackUseCase = new ExternalAuthLoginCallbackUseCase(
				oauthProviderGateway,
				sessionRepository,
				externalIdentityRepository,
				userRepository,
				accountAssociationSessionRepository,
				sessionSecretHasher,
				oauthStateSigner,
			);
			// === End of instances ===

			const signedState = cookieManager.getCookie(OAUTH_STATE_COOKIE_NAME);
			const codeVerifier = cookieManager.getCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			const redirectURI = cookieManager.getCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (!queryState || !timingSafeStringEqual(queryState, signedState)) {
				throw new BadRequestException({
					code: "INVALID_STATE",
					message: "Invalid OAuth state. Please try again.",
				});
			}

			const result = await externalAuthLoginCallbackUseCase.execute(
				APP_ENV === "production",
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
				// エラーがある場合はリダイレクトURLにエラーを追加してリダイレクト
				const {
					code: errorCode,
					context: { redirectURL },
				} = result;

				redirectURL.searchParams.set("error", errorCode);
				return RedirectResponse(redirectURL.toString());
			}

			const { session, sessionToken, redirectURL, clientType } = result.value;

			if (clientType === newClientType("mobile")) {
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
				operationId: "auth-external-auth-login-callback",
				summary: "External Auth Login Callback",
				description: [
					"External Auth Login Callback for the provider",
					"##### **Error Query**",
					"---",
					"- **PROVIDER_ACCESS_DENIED**",
					"- **PROVIDER_ERROR**",
					"- **GET_IDENTITY_FAILED**",
					"- **ACCOUNT_ASSOCIATION_NOT_FOUND**",
					"- **ACCOUNT_ASSOCIATION_AVAILABLE**",
				],
				tag: "Auth - External Auth",
			}),
		},
	);
