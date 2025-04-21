import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { AccountLinkCallbackUseCase } from "../../../application/use-cases/account-link";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../../common/constants";
import { FlattenUnion } from "../../../common/schemas";
import { constantTimeCompare, isErr } from "../../../common/utils";
import { newOAuthProvider, oauthProviderSchema } from "../../../domain/value-object";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { OAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import { OAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";

export const AccountLinkCallback = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimit("account-link-callback", {
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
		"/:provider/link/callback",
		async ({
			env: {
				APP_ENV,
				DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				OAUTH_STATE_HMAC_SECRET,
			},
			cfModuleEnv: { DB },
			cookie,
			params: { provider: _provider },
			redirect,
			query: { code, state: queryState, error },
		}) => {
			// === Instances ===
			const provider = newOAuthProvider(_provider);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/link/callback`, apiBaseURL);

			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

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

			const accountLinkCallbackUseCase = new AccountLinkCallbackUseCase(
				{ APP_ENV, OAUTH_STATE_HMAC_SECRET },
				oauthProviderGateway,
				oauthAccountRepository,
			);
			// === End of instances ===

			const signedState = cookieManager.getCookie(OAUTH_STATE_COOKIE_NAME);
			const codeVerifier = cookieManager.getCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			const redirectURI = cookieManager.getCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (!queryState || !constantTimeCompare(queryState, signedState)) {
				throw new BadRequestException({
					code: "INVALID_STATE",
				});
			}

			const result = await accountLinkCallbackUseCase.execute(
				error,
				redirectURI,
				provider,
				signedState,
				code,
				codeVerifier,
			);

			cookieManager.deleteCookie(OAUTH_STATE_COOKIE_NAME);
			cookieManager.deleteCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			cookieManager.deleteCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (isErr(result)) {
				if (
					result.code === "INVALID_STATE" ||
					result.code === "INVALID_REDIRECT_URL" ||
					result.code === "CODE_NOT_FOUND"
				) {
					throw new BadRequestException({
						code: result.code,
					});
				}

				const {
					code,
					value: { redirectURL },
				} = result;
				redirectURL.searchParams.set("error", code);
				return redirect(redirectURL.toString());
			}

			const { redirectURL } = result;

			return redirect(redirectURL.toString());
		},
		{
			beforeHandle: async ({ rateLimit, ip }) => {
				await rateLimit.consume(ip, 1);
			},
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
				provider: oauthProviderSchema,
			}),
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_STATE_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String({
					minLength: 1,
				}),
			}),
			response: {
				302: t.Void(),
				400: FlattenUnion(
					ErrorResponseSchema("INVALID_STATE"),
					ErrorResponseSchema("INVALID_SIGNED_STATE"),
					ErrorResponseSchema("FAILED_TO_DECODE_SIGNED_STATE"),
					ErrorResponseSchema("INVALID_REDIRECT_URL"),
				),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "auth-account-link-callback",
				summary: "Account Link Callback",
				description: [
					"Account Link Callback for the provider",
					"##### **Error Query**",
					"---",
					"- `FAILED_TO_GET_ACCOUNT_INFO`",
					"- `ACCESS_DENIED`",
					"- `PROVIDER_ERROR`",
					"- `PROVIDER_ALREADY_LINKED`",
					"- `ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER`",
					"- `INVALID_STATE`",
				],
				tag: "Auth - Account Link",
				withAuth: true,
			}),
		},
	);
