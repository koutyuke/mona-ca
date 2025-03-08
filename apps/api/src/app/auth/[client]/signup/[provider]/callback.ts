import { getAPIBaseUrl, getMobileScheme, getWebBaseUrl, validateRedirectUrl } from "@mona-ca/core/utils";
import { t } from "elysia";
import { SessionTokenService } from "../../../../../application/services/session-token";
import { OAuthSignupCallbackUseCase } from "../../../../../application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../../../../common/constants";
import { clientSchema } from "../../../../../common/schema";
import { convertRedirectableMobileScheme, isErr } from "../../../../../common/utils";
import { newOAuthProvider, oauthProviderSchema } from "../../../../../domain/value-object";
import { genderSchema } from "../../../../../domain/value-object";
import { DrizzleService } from "../../../../../infrastructure/drizzle";
import { OAuthProviderGateway } from "../../../../../interface-adapter/gateway/oauth-provider";
import { OAuthAccountRepository } from "../../../../../interface-adapter/repositories/oauth-account";
import { SessionRepository } from "../../../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../../../interface-adapter/repositories/user";
import { CookieService } from "../../../../../modules/cookie";
import { ElysiaWithEnv } from "../../../../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorException } from "../../../../../modules/error";
import { rateLimiter } from "../../../../../modules/rate-limiter";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
	[OAUTH_STATE_COOKIE_NAME]: t.String({
		minLength: 1,
	}),
	[OAUTH_REDIRECT_URL_COOKIE_NAME]: t.String({
		minLength: 1,
	}),
	[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String({
		minLength: 1,
	}),
	[OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME]: t.Optional(
		t.Object({
			gender: t.Optional(genderSchema),
		}),
	),
};

export const ProviderCallback = new ElysiaWithEnv({
	prefix: "/callback",
})
	// Local Middleware & Plugin
	.use(
		rateLimiter("oauth-provider-callback", {
			refillRate: 10,
			maxTokens: 100,
			interval: {
				value: 1,
				unit: "m",
			},
		}),
	)

	// Route
	.get(
		"/",
		async ({
			env: { APP_ENV, SESSION_PEPPER, PASSWORD_PEPPER, ...otherEnv },
			cfModuleEnv: { DB },
			cookie,
			params: { client, provider: _provider },
			query: { code, state: queryState, error },
			redirect,
			set,
		}) => {
			const provider = newOAuthProvider(_provider);
			const apiBaseUrl = getAPIBaseUrl(APP_ENV === "production");
			const clientBaseUrl = client === "web" ? getWebBaseUrl(APP_ENV === "production") : getMobileScheme();

			const providerRedirectUrl = new URL(`auth/${client}/signup/${provider}/callback`, apiBaseUrl);

			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const oauthProviderGateway = OAuthProviderGateway({
				provider,
				env: otherEnv,
				redirectUrl: providerRedirectUrl.toString(),
			});

			const oauthSignupCallbackUseCase = new OAuthSignupCallbackUseCase(
				sessionTokenService,
				oauthProviderGateway,
				sessionRepository,
				oauthAccountRepository,
				userRepository,
			);

			const cookieState = cookieService.getCookie(OAUTH_STATE_COOKIE_NAME);
			const codeVerifier = cookieService.getCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			const redirectUrlCookieValue = cookieService.getCookie(OAUTH_REDIRECT_URL_COOKIE_NAME);

			const redirectToClientUrl = validateRedirectUrl(clientBaseUrl, redirectUrlCookieValue ?? "/");

			if (!redirectToClientUrl) {
				throw new BadRequestException({
					name: "INVALID_REDIRECT_URL",
					message: "Invalid redirect URL.",
				});
			}

			if (error) {
				if (error === "access_denied") {
					redirectToClientUrl.searchParams.set("error", "ACCESS_DENIED");
					return redirect(redirectToClientUrl.toString());
				}

				redirectToClientUrl.searchParams.set("error", "PROVIDER_ERROR");
				return redirect(redirectToClientUrl.toString());
			}

			if (!code || !queryState || queryState !== cookieState) {
				redirectToClientUrl.searchParams.set("error", "INVALID_STATE");
				return redirect(redirectToClientUrl.toString());
			}

			const result = await oauthSignupCallbackUseCase.execute(code, codeVerifier, provider);

			cookieService.deleteCookie(OAUTH_STATE_COOKIE_NAME);
			cookieService.deleteCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME);
			cookieService.deleteCookie(OAUTH_REDIRECT_URL_COOKIE_NAME);
			cookieService.deleteCookie(OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME);

			set.headers["Referrer-Policy"] = "strict-origin";

			if (isErr(result)) {
				switch (result.code) {
					case "FAILED_TO_GET_ACCOUNT_INFO":
					case "EMAIL_ALREADY_EXISTS_BUT_LINKABLE":
					case "ACCOUNT_IS_ALREADY_USED":
						redirectToClientUrl.searchParams.set("error", result.code);
						return redirect(redirectToClientUrl.toString());
					default:
						throw new InternalServerErrorException({
							message: "Unknown OAuthSignupCallbackUseCase error result.",
						});
				}
			}

			const { session, sessionToken } = result;

			if (client === "mobile") {
				redirectToClientUrl.searchParams.set("access-token", sessionToken);
				return redirect(convertRedirectableMobileScheme(redirectToClientUrl));
			}

			cookieService.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			const continueUrl = redirectToClientUrl.searchParams.get("continue");

			if (continueUrl) {
				const validatedContinueUrl = validateRedirectUrl(clientBaseUrl, continueUrl);
				if (validatedContinueUrl) {
					return redirect(validatedContinueUrl.toString());
				}
			}

			return redirect(redirectUrlCookieValue.toString());
		},
		{
			beforeHandle: async ({ rateLimiter, ip }) => {
				await rateLimiter.consume(ip, 1);
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
				client: clientSchema,
			}),
			cookie: t.Cookie(cookieSchemaObject),
		},
	);
