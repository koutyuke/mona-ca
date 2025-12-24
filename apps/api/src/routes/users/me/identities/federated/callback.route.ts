import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
	normalizeRedirectableMobileScheme,
} from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform } from "../../../../../core/domain/value-objects";
import { env } from "../../../../../core/infra/config/env";
import { redirect } from "../../../../../core/infra/elysia";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { identityProvidersSchema, newIdentityProviders } from "../../../../../features/auth";
import { containerPlugin } from "../../../../../plugins/container";
import { pathDetail } from "../../../../../plugins/openapi";

export const ProviderLinkCallback = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())

	// Route
	.get(
		"/:provider/link/callback",
		async ({
			cookie,
			params: { provider: _provider },
			query: { code, state: queryState, error },
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
				});
			}

			const result = await containers.auth.providerLinkCallbackUseCase.execute(
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
					.otherwise(({ code, context: { redirectURL } }) => {
						redirectURL.searchParams.set("error", code);
						return redirect(redirectURL.toString());
					});
			}
			const { redirectURL, clientPlatform } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return redirect(normalizeRedirectableMobileScheme(redirectURL));
			}

			return redirect(redirectURL.toString());
		},
		{
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
				provider: identityProvidersSchema,
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_STATE_COOKIE_NAME]: t.String(),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.String(),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String(),
			}),
			detail: pathDetail({
				operationId: "me-provider-link-callback",
				summary: "Provider Link Callback",
				description: [
					"Provider Link Callback for the provider",
					"---",
					"If success, redirect to the client URL",
					"---",
					"If error, redirect to the client URL with the `error` query param or return Bad Request",
					"Query params:",
					"  - `error`: Error code(INVALID_STATE, INVALID_REDIRECT_URI, TOKEN_EXCHANGE_FAILED, or other error codes)",
					"---",
					"Bad Request errors:",
					"  - `INVALID_STATE`: Invalid OAuth state",
					"  - `INVALID_REDIRECT_URI`: Invalid redirect URL",
					"  - `TOKEN_EXCHANGE_FAILED`: OAuth code is missing",
				],
				tag: "Me - Provider Link",
			}),
		},
	);
