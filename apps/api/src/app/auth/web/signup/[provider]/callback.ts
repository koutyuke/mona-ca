import { AuthUseCase } from "@/application/use-cases/auth";
import { OAuthUseCase } from "@/application/use-cases/oauth";
import { OAuthAccountUseCase } from "@/application/use-cases/oauth-account";
import { UserUseCase } from "@/application/use-cases/user";
import { providerSchema, selectOAuthProviderGateway } from "@/interface-adapter/gateway/oauth-provider";
import { LuciaAdapter } from "@/interface-adapter/lucia";
import { OAuthAccountRepository } from "@/interface-adapter/repositories/oauth-account";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "@mona-ca/core/const";
import { getAPIBaseUrl, getWebBaseUrl, validateRedirectUri } from "@mona-ca/core/utils";
import { t } from "elysia";

const ProviderCallback = new ElysiaWithEnv().get(
	"/callback",
	async ({ params: { provider }, cookie, env, set, cfModuleEnv: { DB }, query: { code, state, error } }) => {
		const { APP_ENV } = env;

		const apiBaseUri = getAPIBaseUrl(APP_ENV === "production");
		const webBaseUri = getWebBaseUrl(APP_ENV === "production");

		const providerGatewayRedirectUri = new URL(`auth/web/signup/${provider}/callback`, apiBaseUri);

		const oAuthUseCase = new OAuthUseCase(
			selectOAuthProviderGateway({
				provider,
				env,
				redirectUri: providerGatewayRedirectUri.toString(),
			}),
		);

		const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter({ db: DB }));

		const oAuthAccountUseCase = new OAuthAccountUseCase(new OAuthAccountRepository({ db: DB }));

		const userUseCase = new UserUseCase(new UserRepository({ db: DB }));

		const stateCookieValue = cookie[OAUTH_STATE_COOKIE_NAME].value;
		const codeVerifierCookieValue = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].value;
		const redirectUriCookieValue = validateRedirectUri(webBaseUri, cookie[OAUTH_REDIRECT_URI_COOKIE_NAME].value ?? "/");

		if (!stateCookieValue || !codeVerifierCookieValue || !redirectUriCookieValue) {
			throw new BadRequestException({ message: "Invalid state or redirect URI" });
		}

		if (error) {
			if (error === "access_denied") {
				redirectUriCookieValue.searchParams.set("error", "ACCESS_DENIED");
				set.redirect = redirectUriCookieValue.toString();
				return;
			}

			redirectUriCookieValue.searchParams.set("error", "PROVIDER_ERROR");
			set.redirect = redirectUriCookieValue.toString();
			return;
		}

		if (!code || !state || state !== stateCookieValue) {
			throw new BadRequestException({ message: "Invalid code or state" });
		}

		try {
			const tokens = await oAuthUseCase.getTokens(code, codeVerifierCookieValue);
			const accessToken = tokens.accessToken();

			const providerAccount = await oAuthUseCase.getAccountInfo(accessToken);

			if (!providerAccount) {
				redirectUriCookieValue.searchParams.set("error", "FAILED_TO_GET_ACCOUNT_INFO");
				set.redirect = redirectUriCookieValue.toString();
				return;
			}

			const [existingUser, existingOAuthAccount] = await Promise.all([
				userUseCase.findUserByEmail(providerAccount.email),
				oAuthAccountUseCase.getOAuthAccountByProviderAndProviderId(provider, providerAccount.id),
			]);

			if (existingOAuthAccount) {
				redirectUriCookieValue.searchParams.set("error", "OAUTH_ACCOUNT_ALREADY_EXISTS");
				set.redirect = redirectUriCookieValue.toString();
				return;
			}

			const newUser =
				existingUser ??
				(await userUseCase.createUser({
					name: providerAccount.name,
					email: providerAccount.email,
					emailVerified: providerAccount.emailVerified,
					iconUrl: providerAccount.iconUrl,
				}));

			const [session] = await Promise.all([
				authUseCase.createSession(newUser.id),
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

			const continueUrl = redirectUriCookieValue.searchParams.get("continue");

			if (continueUrl) {
				const validatedContinueUrl = validateRedirectUri(webBaseUri, continueUrl);
				if (validatedContinueUrl) {
					set.redirect = validatedContinueUrl.toString();
					return;
				}
			}

			set.redirect = redirectUriCookieValue.toString();
		} catch (error) {
			console.error(error);
			redirectUriCookieValue.searchParams.set("error", "INTERNAL_SERVER_ERROR");
			set.redirect = redirectUriCookieValue.toString();
			return;
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
			provider: providerSchema,
		}),
		cookie: t.Cookie({
			[OAUTH_STATE_COOKIE_NAME]: t.String(),
			[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.String(),
			[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.String(),
		}),
	},
);

export { ProviderCallback };
