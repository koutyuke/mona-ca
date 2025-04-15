import { getAPIBaseURL, getMobileScheme, getWebBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { OAuthRequestUseCase } from "../../../application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { clientTypeSchema, newClientType, newOAuthProvider, oauthProviderSchema } from "../../../domain/value-object";
import { OAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimiter } from "../../../modules/rate-limiter";

export const OAuthLoginRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimiter("oauth-login-request", {
			maxTokens: 100,
			refillRate: 10,
			refillInterval: {
				value: 1,
				unit: "m",
			},
		}),
	)

	// Route
	.get(
		"/:provider/login",
		async ({
			params: { provider: _provider },
			cookie,
			env: {
				APP_ENV,
				DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				OAUTH_STATE_HMAC_SECRET,
			},
			query: { "redirect-uri": queryRedirectUri = "/", "client-type": _clientType },
			redirect,
		}) => {
			// === Instances ===
			const provider = newOAuthProvider(_provider);
			const clientType = newClientType(_clientType);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/login/callback`, apiBaseURL);

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
			const oauthRequestUseCase = new OAuthRequestUseCase(oauthProviderGateway, OAUTH_STATE_HMAC_SECRET);
			// === End of instances ===

			const clientBaseURL = clientType === "web" ? getWebBaseURL(APP_ENV === "production") : getMobileScheme();

			const result = oauthRequestUseCase.execute(clientType, clientBaseURL, queryRedirectUri);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					name: code,
					message: "Invalid redirect URL.",
				});
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

			return redirect(redirectToProviderURL.toString());
		},
		{
			beforeHandle: async ({ rateLimiter, ip }) => {
				await rateLimiter.consume(ip, 1);
			},
			query: t.Object({
				"client-type": clientTypeSchema,
				"redirect-uri": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: oauthProviderSchema,
			}),
			response: {
				302: t.Void(),
				400: ErrorResponseSchema("INVALID_REDIRECT_URL"),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			cookie: t.Cookie({
				[OAUTH_STATE_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "auth-oauth-login-request",
				summary: "OAuth Login Request",
				description: "OAuth Login Request for the provider",
				tag: "Auth - OAuth",
			}),
		},
	);
