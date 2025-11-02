import { Elysia, t } from "elysia";
import { clientTypeSchema, newClientType } from "../../../core/domain/value-objects";
import { env } from "../../../core/infra/config/env";
import { defaultCookieOptions, redirect } from "../../../core/infra/elysia";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../core/lib/http";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../features/auth";
import { newAccountLinkSessionToken } from "../../../features/auth/domain/value-objects/session-token";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const AccountLinkRequest = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())

	// Route
	.get(
		"/:provider/link",
		async ({
			cookie,
			params: { provider: _provider },
			query: { "redirect-uri": queryRedirectURI = "/", "client-type": _clientType, "link-token": _linkToken },
			headers,
			containers,
			status,
		}) => {
			const provider = newExternalIdentityProvider(_provider);
			const clientType = newClientType(_clientType);
			const accountLinkSessionToken = newAccountLinkSessionToken(_linkToken);

			const result = await containers.auth.accountLinkRequestUseCase.execute(
				env.APP_ENV === "production",
				clientType,
				provider,
				queryRedirectURI,
				accountLinkSessionToken,
			);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_REDIRECT_URI") {
					return status("Bad Request", {
						code: code,
						message: "Invalid redirect URI. Please check the URI and try again.",
					});
				}
				if (code === "ACCOUNT_LINK_SESSION_EXPIRED") {
					return status("Bad Request", {
						code: code,
						message: "Account link session expired.",
					});
				}
				if (code === "ACCOUNT_LINK_SESSION_INVALID") {
					return status("Bad Request", {
						code: code,
						message: "Account link session invalid.",
					});
				}
			}

			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

			headers["referrer-policy"] = "no-referrer";
			headers["cache-control"] = "no-cache";

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

			return redirect(redirectToProviderURL.toString());
		},
		{
			query: t.Object({
				"client-type": clientTypeSchema,
				"link-token": t.String(),
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
