import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { OAuthRequestUseCase, oauthStateSchema } from "../../../application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { clientTypeSchema, newClientType, newOAuthProvider, oauthProviderSchema } from "../../../domain/value-object";
import { HmacOAuthStateSigner } from "../../../infrastructure/crypt";
import { OAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import { CookieManager } from "../../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	RedirectResponse,
	RedirectResponseSchema,
	withBaseResponseSchema,
} from "../../../modules/elysia-with-env";
import { BadRequestException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";

export const OAuthSignupRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimit("oauth-signup-request", {
			maxTokens: 100,
			refillRate: 50,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.get(
		"/:provider/signup",
		async ({
			env: {
				APP_ENV,
				DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				OAUTH_STATE_HMAC_SECRET,
			},
			params: { provider: _provider },
			cookie,
			query: { "redirect-uri": queryRedirectURI = "/", "client-type": _clientType },
		}) => {
			// === Instances ===
			const provider = newOAuthProvider(_provider);
			const clientType = newClientType(_clientType);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/signup/callback`, apiBaseURL);

			const cookieManager = new CookieManager(APP_ENV === "production", cookie);
			const oauthProviderGateway = OAuthProviderGateway(
				{
					DISCORD_CLIENT_ID,
					DISCORD_CLIENT_SECRET,
					GOOGLE_CLIENT_ID,
					GOOGLE_CLIENT_SECRET,
				},
				provider,
				providerRedirectURL.toString(),
			);

			const oauthStateSigner = new HmacOAuthStateSigner(OAUTH_STATE_HMAC_SECRET, oauthStateSchema);

			const oauthRequestUseCase = new OAuthRequestUseCase(oauthProviderGateway, oauthStateSigner);
			// === End of instances ===

			const result = oauthRequestUseCase.execute(APP_ENV === "production", clientType, queryRedirectURI);

			if (isErr(result)) {
				const { code } = result;

				switch (code) {
					case "INVALID_REDIRECT_URL":
						throw new BadRequestException({
							code: code,
							message: "Invalid redirect URL. Please check the URL and try again.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "OAuth signup request failed. Please try again.",
						});
				}
			}

			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result;

			cookieManager.setCookie(OAUTH_STATE_COOKIE_NAME, state, {
				maxAge: 60 * 10,
			});

			cookieManager.setCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
				maxAge: 60 * 10,
			});

			cookieManager.setCookie(OAUTH_REDIRECT_URI_COOKIE_NAME, redirectToClientURL.toString(), {
				maxAge: 60 * 10,
			});

			return RedirectResponse(redirectToProviderURL.toString());
		},
		{
			beforeHandle: async ({ rateLimit, ip }) => {
				await rateLimit.consume(ip, 1);
			},
			query: t.Object({
				"client-type": clientTypeSchema,
				"redirect-uri": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: oauthProviderSchema,
			}),
			cookie: t.Cookie({
				[OAUTH_STATE_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				302: RedirectResponseSchema,
				400: ErrorResponseSchema("INVALID_REDIRECT_URL"),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-oauth-signup-request",
				summary: "OAuth Signup Request",
				description: "OAuth Signup Request for the provider",
				tag: "Auth - OAuth",
			}),
		},
	);
