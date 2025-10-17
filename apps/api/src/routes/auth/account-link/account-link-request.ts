import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../common/domain/value-objects";
import { createOAuthGateway } from "../../../features/auth/adapters/gateways/oauth-provider";
import { CookieManager } from "../../../features/auth/adapters/http/cookie";
import {
	AccountLinkRequestUseCase,
	accountLinkStateSchema,
} from "../../../features/auth/application/use-cases/account-link";
import { HmacOAuthStateSigner } from "../../../infrastructure/crypto";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../lib/constants";
import { AuthGuardSchema, authGuard } from "../../../plugins/auth-guard";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";

export const AccountLinkRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.get(
		"/:provider/link",
		async ({
			env: {
				APP_ENV,
				OAUTH_STATE_HMAC_SECRET,
				DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
			},
			cookie,
			params: { provider: _provider },
			query: { "redirect-uri": queryRedirectURI = "/" },
			clientType,
			user,
		}) => {
			// === Instances ===
			const provider = newExternalIdentityProvider(_provider);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/link/callback`, apiBaseURL);

			const cookieManager = new CookieManager(APP_ENV === "production", cookie);
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
			const oauthStateSigner = new HmacOAuthStateSigner(OAUTH_STATE_HMAC_SECRET, accountLinkStateSchema);

			const accountLinkRequestUseCase = new AccountLinkRequestUseCase(oauthProviderGateway, oauthStateSigner);
			// === End of instances ===

			const result = accountLinkRequestUseCase.execute(APP_ENV === "production", clientType, queryRedirectURI, user.id);

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
