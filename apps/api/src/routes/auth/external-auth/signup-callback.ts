import { Elysia, t } from "elysia";
import { newClientType } from "../../../core/domain/value-objects";
import { env } from "../../../core/infra/config/env";
import { defaultCookieOptions } from "../../../core/infra/elysia";
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
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const ExternalAuthSignupCallback = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		ratelimitPlugin("external-auth-signup-callback", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.onBeforeHandle(async ({ rateLimit, ipAddress, status }) => {
		const result = await rateLimit.consume(ipAddress, 1);
		if (result.isErr) {
			return status("Too Many Requests", {
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests. Please try again later.",
			});
		}
		return;
	})

	// Route
	.get(
		"/:provider/signup/callback",
		async ({
			containers,
			cookie,
			params: { provider: _provider },
			query: { code, state: queryState, error },
			set,
			status,
			redirect,
		}) => {
			const provider = newExternalIdentityProvider(_provider);
			const signedState = cookie[OAUTH_STATE_COOKIE_NAME].value;
			const codeVerifier = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].value;
			const redirectURI = cookie[OAUTH_REDIRECT_URI_COOKIE_NAME].value;

			if (!queryState || !timingSafeStringEqual(queryState, signedState)) {
				return status("Bad Request", {
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

			cookie[OAUTH_STATE_COOKIE_NAME].remove();
			cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].remove();
			cookie[OAUTH_REDIRECT_URI_COOKIE_NAME].remove();

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_STATE") {
					return status("Bad Request", {
						code: code,
						message: "Invalid OAuth state. Please try again.",
					});
				}
				if (code === "INVALID_REDIRECT_URI") {
					return status("Bad Request", {
						code: code,
						message: "Invalid redirect URL. Please check the URL and try again.",
					});
				}
				if (code === "TOKEN_EXCHANGE_FAILED") {
					return status("Bad Request", {
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
						return redirect(convertRedirectableMobileScheme(redirectURL));
					}

					cookie[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME].set({
						...defaultCookieOptions,
						value: accountAssociationSessionToken,
						expires: accountAssociationSession.expiresAt,
					});

					redirectURL.searchParams.set("error", errorCode);
					return redirect(redirectURL.toString());
				}
				// If there is an error, add the error to the redirect URL and redirect
				const {
					code: errorCode,
					context: { redirectURL },
				} = result;

				redirectURL.searchParams.set("error", errorCode);
				return redirect(redirectURL.toString());
			}

			const { session, sessionToken, redirectURL, clientType } = result.value;

			if (clientType === "mobile") {
				redirectURL.searchParams.set("access-token", sessionToken);
				set.headers["referrer-policy"] = "strict-origin";
				return redirect(convertRedirectableMobileScheme(redirectURL));
			}

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: sessionToken,
				expires: session.expiresAt,
			});

			return redirect(redirectURL.toString());
		},
		{
			query: t.Object(
				{
					code: t.Optional(t.String()),
					state: t.Optional(t.String()),
					error: t.Optional(t.String()),
				},
				{ additionalProperties: true },
			),
			params: t.Object({
				provider: externalIdentityProviderSchema,
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_STATE_COOKIE_NAME]: t.String(),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.String(),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String(),
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
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
