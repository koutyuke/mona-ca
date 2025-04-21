import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { AccountLinkRequestUseCase } from "../../../application/use-cases/account-link";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../common/constants";
import { FlattenUnion } from "../../../common/schemas";
import { isErr } from "../../../common/utils";
import { newOAuthProvider, oauthProviderSchema } from "../../../domain/value-object";
import { OAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import { AuthGuardSchema, authGuard } from "../../../modules/auth-guard";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";

export const AccountLinkRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimit("account-link-request", {
			maxTokens: 100,
			refillRate: 10,
			refillInterval: {
				value: 1,
				unit: "m",
			},
		}),
	)
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
			const provider = newOAuthProvider(_provider);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/link/callback`, apiBaseURL);

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

			const accountLinkRequestUseCase = new AccountLinkRequestUseCase(
				{ APP_ENV, OAUTH_STATE_HMAC_SECRET },
				oauthProviderGateway,
			);
			// === End of instances ===

			const result = accountLinkRequestUseCase.execute(clientType, queryRedirectURI, user.id);

			if (isErr(result)) {
				throw new BadRequestException({
					code: result.code,
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
				provider: oauthProviderSchema,
			}),
			response: {
				200: t.Object({
					url: t.String(),
				}),
				400: FlattenUnion(ErrorResponseSchema("INVALID_REDIRECT_URL"), AuthGuardSchema.response[400]),
				401: AuthGuardSchema.response[401],
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
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
