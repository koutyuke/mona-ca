import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { SessionTokenService } from "../../../application/services/session-token";
import { OAuthSignupCallbackUseCase } from "../../../application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../../common/constants";
import { FlattenUnion } from "../../../common/schemas";
import { constantTimeCompare, convertRedirectableMobileScheme, isErr } from "../../../common/utils";
import { newOAuthProvider, oauthProviderSchema } from "../../../domain/value-object";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { OAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import { OAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";

export const OAuthSignupCallback = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimit("oauth-signup-callback", {
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
		"/:provider/signup/callback",
		async ({
			env: {
				APP_ENV,
				SESSION_PEPPER,
				DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				OAUTH_STATE_HMAC_SECRET,
			},
			cfModuleEnv: { DB },
			cookie,
			params: { provider: _provider },
			query: { code, state: queryState, error },
			redirect,
			set,
		}) => {
			// === Instances ===
			const provider = newOAuthProvider(_provider);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/signup/callback`, apiBaseURL);

			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

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

			const oauthSignupCallbackUseCase = new OAuthSignupCallbackUseCase(
				{ APP_ENV, OAUTH_STATE_HMAC_SECRET },
				sessionTokenService,
				oauthProviderGateway,
				sessionRepository,
				oauthAccountRepository,
				userRepository,
			);
			// === End of instances ===

			const signedState = cookieManager.getCookie(OAUTH_STATE_COOKIE_NAME);
			const codeVerifier = cookieManager.getCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			const redirectURI = cookieManager.getCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (!queryState || !constantTimeCompare(queryState, signedState)) {
				throw new BadRequestException({
					name: "INVALID_STATE",
					message: "Invalid state",
				});
			}

			const result = await oauthSignupCallbackUseCase.execute(
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

			const { session, sessionToken, redirectURL, clientType } = result;

			if (clientType === "mobile") {
				redirectURL.searchParams.set("access-token", sessionToken);
				set.headers["referrer-policy"] = "strict-origin";
				return redirect(convertRedirectableMobileScheme(redirectURL));
			}

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return redirect(redirectURI.toString());
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
				operationId: "auth-oauth-signup-callback",
				summary: "OAuth Signup Callback",
				description: [
					"OAuth Signup Callback for the provider",
					"##### **Error Query**",
					"---",
					"- `FAILED_TO_GET_ACCOUNT_INFO`",
					"- `ACCOUNT_IS_ALREADY_USED`",
					"- `ACCESS_DENIED`",
					"- `PROVIDER_ERROR`",
					"- `EMAIL_ALREADY_EXISTS_BUT_LINKABLE`",
				],
				tag: "Auth - OAuth",
			}),
		},
	);
