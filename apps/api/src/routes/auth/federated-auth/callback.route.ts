import {
	ACCOUNT_LINK_REQUEST_COOKIE_NAME,
	normalizeRedirectableMobileScheme,
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform } from "../../../core/domain/value-objects";
import { env } from "../../../core/infra/config/env";
import { defaultCookieOptions, redirect } from "../../../core/infra/elysia";
import { timingSafeStringEqual } from "../../../core/lib/security";
import { identityProvidersSchema, newIdentityProviders } from "../../../features/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const FederatedAuthCallbackRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		ratelimitPlugin("federated-auth-callback", {
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
		"/:provider/callback",
		async ({
			cookie,
			params: { provider: _provider },
			query: { code, state: queryState, error },
			set,
			containers,
			status,
		}) => {
			const provider = newIdentityProviders(_provider);

			const signedState = cookie[OAUTH_STATE_COOKIE_NAME].value;
			const codeVerifier = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].value;
			const redirectURI = cookie[OAUTH_REDIRECT_URI_COOKIE_NAME].value;

			if (!queryState || !timingSafeStringEqual(queryState, signedState)) {
				return status("Bad Request", {
					code: "INVALID_STATE",
					message: "Invalid OAuth state. Please try again.",
				});
			}

			const result = await containers.auth.federatedAuthCallbackUseCase.execute(
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
				return match(result)

					.with({ code: "INVALID_STATE" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "Invalid OAuth state. Please try again.",
						}),
					)
					.with({ code: "INVALID_REDIRECT_URI" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "Invalid redirect URL. Please check the URL and try again.",
						}),
					)
					.with({ code: "TOKEN_EXCHANGE_FAILED" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "OAuth code is missing. Please try again.",
						}),
					)
					.with(
						{ code: "ACCOUNT_LINK_REQUEST" },
						({ code, context: { redirectURL, clientPlatform, accountLinkRequestToken, accountLinkRequest } }) => {
							if (isMobilePlatform(clientPlatform)) {
								redirectURL.searchParams.set("link-token", accountLinkRequestToken);
								redirectURL.searchParams.set("error", code);
								set.headers["referrer-policy"] = "strict-origin";
								return redirect(normalizeRedirectableMobileScheme(redirectURL));
							}

							cookie[ACCOUNT_LINK_REQUEST_COOKIE_NAME].set({
								...defaultCookieOptions,
								value: accountLinkRequestToken,
								expires: accountLinkRequest.expiresAt,
							});

							redirectURL.searchParams.set("error", code);
							return redirect(redirectURL.toString());
						},
					)
					.otherwise(({ code, context: { redirectURL } }) => {
						redirectURL.searchParams.set("error", code);
						return redirect(redirectURL.toString());
					});
			}

			const { session, sessionToken, redirectURL, clientPlatform, flow } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				redirectURL.searchParams.set("session-token", sessionToken);
				redirectURL.searchParams.set("flow", flow);
				set.headers["referrer-policy"] = "strict-origin";
				return redirect(normalizeRedirectableMobileScheme(redirectURL));
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
				provider: identityProvidersSchema,
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_STATE_COOKIE_NAME]: t.String(),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.String(),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String(),
				[ACCOUNT_LINK_REQUEST_COOKIE_NAME]: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "auth-federated-auth-callback",
				summary: "Federated Auth Callback",
				description: [
					"Federated Auth Callback for the provider",
					"---",
					"If success, redirect to the client URL with the `session-token` and `flow` query params",
					"Query params:",
					"  - `session-token`: Session token",
					"  - `flow`: Flow(login, signup)",
					"---",
					"If account link is available, redirect to the client URL with the `link-token` and `error` query params",
					"Query params:",
					"  - `link-token`: Account link request token",
					"  - `error`: Error code(ACCOUNT_LINK_AVAILABLE)",
					"---",
					"If error, redirect to the client URL with the `error` query param",
					"Query params:",
					"  - `error`: Error code(PROVIDER_ACCESS_DENIED, PROVIDER_ERROR, TOKEN_EXCHANGE_FAILED, FETCH_IDENTITY_PROVIDER_USER_FAILED)",
				],
				tag: "Auth - Federated Auth",
			}),
		},
	);
