import { Elysia, t } from "elysia";
import { env } from "../../../core/infra/config/env";
import { defaultCookieOptions } from "../../../core/infra/elysia";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../core/lib/http";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../features/auth";
import { authPlugin } from "../../../plugins/auth";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const AccountLinkRequest = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())
	.use(authPlugin())

	// Route
	.get(
		"/:provider/link",
		async ({
			cookie,
			params: { provider: _provider },
			query: { "redirect-uri": queryRedirectURI = "/" },
			clientType,
			userIdentity,
			containers,
			status,
		}) => {
			const provider = newExternalIdentityProvider(_provider);

			const result = containers.auth.accountLinkRequestUseCase.execute(
				env.APP_ENV === "production",
				clientType,
				provider,
				queryRedirectURI,
				userIdentity.id,
			);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_REDIRECT_URI") {
					return status("Bad Request", {
						code: code,
						message: "Invalid redirect URI. Please check the URI and try again.",
					});
				}
				return status("Bad Request", {
					code: code,
					message: "Account link request failed. Please try again.",
				});
			}

			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

			cookie[OAUTH_STATE_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: state,
				maxAge: 60 * 10,
			});

			cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: codeVerifier,
				maxAge: 60 * 10,
			});

			cookie[OAUTH_REDIRECT_URI_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: redirectToClientURL.toString(),
				maxAge: 60 * 10,
			});

			return {
				url: redirectToProviderURL.toString(),
			};
		},
		{
			requireAuth: true,
			query: t.Object({
				"redirect-uri": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: externalIdentityProviderSchema,
			}),
			cookie: t.Cookie({
				[OAUTH_STATE_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "auth-account-link-request",
				summary: "Account Link Request",
				description: "Account Link Request for the provider",
				tag: "Auth - Account Link",
			}),
		},
	);
