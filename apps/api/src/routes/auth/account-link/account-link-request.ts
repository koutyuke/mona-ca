import { Elysia, t } from "elysia";
import { env } from "../../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../core/lib/http";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../features/auth";
import { AuthGuardSchema, authGuard } from "../../../plugins/auth-guard";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/openapi";

export const AccountLinkRequest = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(authGuard())

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
		}) => {
			const provider = newExternalIdentityProvider(_provider);
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

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
					throw new BadRequestException({
						code: code,
						message: "Invalid redirect URI. Please check the URI and try again.",
					});
				}
				throw new BadRequestException({
					code: code,
					message: "Account link request failed. Please try again.",
				});
			}

			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

			cookieManager.setCookie(OAUTH_STATE_COOKIE_NAME, state, {
				maxAge: 60 * 10,
			});

			cookieManager.setCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
				maxAge: 60 * 10,
			});

			cookieManager.setCookie(OAUTH_REDIRECT_URI_COOKIE_NAME, redirectToClientURL.toString(), {
				maxAge: 60 * 10,
			});

			return {
				url: redirectToProviderURL.toString(),
			};
		},
		{
			headers: AuthGuardSchema.headers,
			query: t.Object({
				"redirect-uri": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: externalIdentityProviderSchema,
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					url: t.String(),
				}),
				400: ResponseTUnion(ErrorResponseSchema("INVALID_REDIRECT_URI"), AuthGuardSchema.response[400]),
				401: AuthGuardSchema.response[401],
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
