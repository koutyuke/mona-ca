import { AuthUseCase } from "@/application/use-cases/auth";
import { OAuthUseCase } from "@/application/use-cases/oauth";
import { OAuthAccountUseCase } from "@/application/use-cases/oauth-account";
import { UserUseCase } from "@/application/use-cases/user";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "@/common/constants";
import { oAuthProviderSchema } from "@/domain/oauth-account/provider";
import { Argon2idService } from "@/infrastructure/argon2id";
import { DrizzleService } from "@/infrastructure/drizzle";
import { selectOAuthProviderGateway } from "@/interface-adapter/gateway/oauth-provider";
import { OAuthAccountRepository } from "@/interface-adapter/repositories/oauth-account";
import { SessionRepository } from "@/interface-adapter/repositories/session";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { getAPIBaseUrl, getWebBaseUrl, validateRedirectUrl } from "@mona-ca/core/utils";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";

const ProviderCallback = new ElysiaWithEnv({
	prefix: "/callback",
})
	// Route
	.get(
		"/",
		async ({ params: { provider }, cookie, env, redirect, cfModuleEnv: { DB }, query: { code, state, error } }) => {
			const { APP_ENV, SESSION_PEPPER } = env;

			const apiBaseUrl = getAPIBaseUrl(APP_ENV === "production");
			const webBaseUrl = getWebBaseUrl(APP_ENV === "production");

			const providerGatewayRedirectUrl = new URL(`auth/web/signup/${provider}/callback`, apiBaseUrl);

			const drizzleService = new DrizzleService(DB);
			const argon2idService = new Argon2idService();

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

			const oAuthUseCase = new OAuthUseCase(
				selectOAuthProviderGateway({
					provider,
					env,
					redirectUrl: providerGatewayRedirectUrl.toString(),
				}),
			);

			const authUseCase = new AuthUseCase(APP_ENV === "production", sessionRepository, argon2idService);
			const oAuthAccountUseCase = new OAuthAccountUseCase(oauthAccountRepository);
			const userUseCase = new UserUseCase(userRepository);

			const stateCookieValue = cookie[OAUTH_STATE_COOKIE_NAME].value;
			const codeVerifierCookieValue = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].value;
			const redirectUrlCookieValue = validateRedirectUrl(
				webBaseUrl,
				cookie[OAUTH_REDIRECT_URL_COOKIE_NAME].value ?? "/",
			);
			const optionalAccountInfoCookieValue = cookie[OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME].value;

			const convertedOptionalAccountInfo = (() => {
				try {
					return typeof optionalAccountInfoCookieValue === "string"
						? JSON.parse(optionalAccountInfoCookieValue)
						: optionalAccountInfoCookieValue;
				} catch (e) {
					return {};
				}
			})();

			const { gender = "man" } = Value.Check(
				t.Object({
					gender: t.Optional(t.Union([t.Literal("man"), t.Literal("woman")])),
				}),
				convertedOptionalAccountInfo,
			)
				? convertedOptionalAccountInfo
				: {};

			if (!redirectUrlCookieValue) {
				throw new BadRequestException({ message: "Invalid state or redirect URL" });
			}

			if (error) {
				if (error === "access_denied") {
					redirectUrlCookieValue.searchParams.set("error", "ACCESS_DENIED");
					return redirect(redirectUrlCookieValue.toString());
				}

				redirectUrlCookieValue.searchParams.set("error", "PROVIDER_ERROR");
				return redirect(redirectUrlCookieValue.toString());
			}

			if (!code || !state || state !== stateCookieValue) {
				throw new BadRequestException({ message: "Invalid code or state" });
			}

			try {
				const tokens = await oAuthUseCase.getTokens(code, codeVerifierCookieValue);
				const accessToken = tokens.accessToken();

				const providerAccount = await oAuthUseCase.getAccountInfo(accessToken);

				if (!providerAccount) {
					redirectUrlCookieValue.searchParams.set("error", "FAILED_TO_GET_ACCOUNT_INFO");
					return redirect(redirectUrlCookieValue.toString());
				}

				const [existingUser, existingOAuthAccount] = await Promise.all([
					userUseCase.getUserByEmail(providerAccount.email),
					oAuthAccountUseCase.getOAuthAccountByProviderAndProviderId(provider, providerAccount.id),
				]);

				if (existingOAuthAccount) {
					redirectUrlCookieValue.searchParams.set("error", "OAUTH_ACCOUNT_ALREADY_EXISTS");
					return redirect(redirectUrlCookieValue.toString());
				}

				const newUser =
					existingUser ??
					(
						await userUseCase.createUser({
							name: providerAccount.name,
							email: providerAccount.email,
							emailVerified: providerAccount.emailVerified,
							iconUrl: providerAccount.iconUrl,
							gender,
						})
					).user;

				const sessionToken = authUseCase.generateSessionToken();

				const [session] = await Promise.all([
					authUseCase.createSession(sessionToken, SESSION_PEPPER, newUser.id),
					oAuthAccountUseCase.createOAuthAccount({
						userId: newUser.id,
						provider,
						providerId: providerAccount.id,
					}),
				]);
				const sessionCookie = authUseCase.createSessionCookie(session.id);

				cookie[SESSION_COOKIE_NAME]?.set({
					value: sessionCookie.value,
					...sessionCookie.attributes,
				});

				const continueUrl = redirectUrlCookieValue.searchParams.get("continue");

				if (continueUrl) {
					const validatedContinueUrl = validateRedirectUrl(webBaseUrl, continueUrl);
					if (validatedContinueUrl) {
						return redirect(validatedContinueUrl.toString());
					}
				}

				return redirect(redirectUrlCookieValue.toString());
			} catch (error) {
				console.error(error);
				redirectUrlCookieValue.searchParams.set("error", "INTERNAL_SERVER_ERROR");
				return redirect(redirectUrlCookieValue.toString());
			}
		},
		{
			query: t.Object(
				{
					code: t.Optional(t.String()),
					state: t.Optional(t.String()),
					error: t.Optional(t.String()),
				},
				{ additionalProperties: true },
			),
			params: t.Object({
				provider: oAuthProviderSchema,
			}),
			cookie: t.Cookie({
				[OAUTH_STATE_COOKIE_NAME]: t.String(),
				[OAUTH_REDIRECT_URL_COOKIE_NAME]: t.String(),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String(),
				[OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME]: t.Optional(
					t.Object({
						gender: t.Optional(t.Union([t.Literal("man"), t.Literal("woman")])),
					}),
				),
			}),
		},
	);

export { ProviderCallback };
