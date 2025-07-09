import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { SessionSecretService } from "../../../application/services/session";
import { OAuthLoginCallbackUseCase } from "../../../application/use-cases/oauth";
import {
	ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME,
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../../common/constants";
import { convertRedirectableMobileScheme, isErr, timingSafeStringEqual } from "../../../common/utils";
import { newClientType, newOAuthProvider, oauthProviderSchema } from "../../../domain/value-object";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { OAuthProviderGateway } from "../../../interface-adapter/gateway/oauth-provider";
import { AccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import { OAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	InternalServerErrorResponseSchema,
	RedirectResponse,
	RedirectResponseSchema,
	ResponseTUnion,
} from "../../../modules/elysia-with-env";
import { BadRequestException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { RateLimiterSchema, rateLimit } from "../../../modules/rate-limit";

export const OAuthLoginCallback = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimit("oauth-login-callback", {
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
		"/:provider/login/callback",
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
			set,
		}) => {
			// === Instances ===
			const provider = newOAuthProvider(_provider);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/login/callback`, apiBaseURL);

			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);
			const sessionSecretService = new SessionSecretService(SESSION_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);
			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
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

			const oauthLoginCallbackUseCase = new OAuthLoginCallbackUseCase(
				{ APP_ENV, OAUTH_STATE_HMAC_SECRET },
				sessionSecretService,
				oauthProviderGateway,
				sessionRepository,
				oauthAccountRepository,
				userRepository,
				accountAssociationSessionRepository,
			);
			// === End of instances ===

			const signedState = cookieManager.getCookie(OAUTH_STATE_COOKIE_NAME);
			const codeVerifier = cookieManager.getCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			const redirectURI = cookieManager.getCookie(OAUTH_REDIRECT_URI_COOKIE_NAME);

			if (!queryState || !timingSafeStringEqual(queryState, signedState)) {
				throw new BadRequestException({
					code: "INVALID_OAUTH_STATE",
					message: "Invalid OAuth state. Please try again.",
				});
			}

			const result = await oauthLoginCallbackUseCase.execute(
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
				const { code } = result;

				switch (code) {
					case "INVALID_OAUTH_STATE":
						throw new BadRequestException({
							code: code,
							message: "Invalid OAuth state. Please try again.",
						});
					case "INVALID_REDIRECT_URL":
						throw new BadRequestException({
							code: code,
							message: "Invalid redirect URL. Please check the URL and try again.",
						});
					case "OAUTH_CREDENTIALS_INVALID":
						throw new BadRequestException({
							code: code,
							message: "OAuth code is missing. Please try again.",
						});
					case "OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE": {
						// Account Association Challenge Flow
						const {
							code: errorCode,
							value: { redirectURL, clientType, accountAssociationSessionToken, accountAssociationSession },
						} = result;

						if (clientType === newClientType("mobile")) {
							redirectURL.searchParams.set("account-association-session-token", accountAssociationSessionToken);
							redirectURL.searchParams.set("error", errorCode);
							set.headers["referrer-policy"] = "strict-origin";
							return RedirectResponse(convertRedirectableMobileScheme(redirectURL));
						}

						cookieManager.setCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME, accountAssociationSessionToken, {
							expires: accountAssociationSession.expiresAt,
						});

						redirectURL.searchParams.set("error", errorCode);
						return RedirectResponse(redirectURL.toString());
					}
					default: {
						// エラーがある場合はリダイレクトURLにエラーを追加してリダイレクト
						const {
							code: errorCode,
							value: { redirectURL },
						} = result;
						redirectURL.searchParams.set("error", errorCode);
						return RedirectResponse(redirectURL.toString());
					}
				}
			}

			const { session, sessionToken, redirectURL, clientType } = result;

			if (clientType === newClientType("mobile")) {
				redirectURL.searchParams.set("access-token", sessionToken);
				set.headers["referrer-policy"] = "strict-origin";
				return RedirectResponse(convertRedirectableMobileScheme(redirectURL));
			}

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return RedirectResponse(redirectURI.toString());
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
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			response: {
				302: RedirectResponseSchema,
				400: ResponseTUnion(
					ErrorResponseSchema("INVALID_OAUTH_STATE"),
					ErrorResponseSchema("INVALID_REDIRECT_URL"),
					ErrorResponseSchema("OAUTH_CREDENTIALS_INVALID"),
				),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "auth-oauth-login-callback",
				summary: "OAuth Login Callback",
				description: [
					"OAuth Login Callback for the provider",
					"##### **Error Query**",
					"---",
					"- **FAILED_TO_FETCH_OAUTH_ACCOUNT**",
					"- **OAUTH_ACCESS_DENIED**",
					"- **OAUTH_PROVIDER_ERROR**",
					"- **OAUTH_ACCOUNT_NOT_FOUND**",
					"- **OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE**",
					"- **OAUTH_ACCOUNT_INFO_INVALID**",
				],
				tag: "Auth - OAuth",
			}),
		},
	);
