import { Elysia, t } from "elysia";
import { env } from "../../../core/infra/config/env";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../../core/lib/http";
import { timingSafeStringEqual } from "../../../core/lib/security";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../features/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const AccountLinkCallback = new Elysia()
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
			redirect,
		}) => {
			const provider = newExternalIdentityProvider(_provider);

			const signedState = cookie[OAUTH_STATE_COOKIE_NAME].value;
			const codeVerifier = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].value;
			const redirectURI = cookie[OAUTH_REDIRECT_URI_COOKIE_NAME].value;

			if (!queryState || !timingSafeStringEqual(queryState, signedState)) {
				return status("Bad Request", {
					code: "INVALID_STATE",
				});
			}

			const result = await containers.auth.accountLinkCallbackUseCase.execute(
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

				const {
					code: errorCode,
					context: { redirectURL },
				} = result;

				redirectURL.searchParams.set("error", errorCode);
				return redirect(redirectURL.toString());
			}

			const { redirectURL } = result.value;

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
				provider: externalIdentityProviderSchema,
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_STATE_COOKIE_NAME]: t.String(),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.String(),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String(),
			}),
			detail: pathDetail({
				operationId: "auth-account-link-callback",
				summary: "Account Link Callback",
				description: [
					"Account Link Callback for the provider",
					"##### **Error Query**",
					"---",
					"- **PROVIDER_ACCESS_DENIED**",
					"- **PROVIDER_ERROR**",
					"- **GET_IDENTITY_FAILED**",
					"- **PROVIDER_ALREADY_LINKED**",
					"- **ACCOUNT_LINKED_ELSEWHERE**",
				],
				tag: "Auth - Account Link",
			}),
		},
	);
