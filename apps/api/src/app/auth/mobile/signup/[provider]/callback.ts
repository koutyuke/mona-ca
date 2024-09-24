import { AuthUseCase } from "@/application/use-cases/auth";
import { OAuthUseCase } from "@/application/use-cases/oauth";
import { OAuthAccountUseCase } from "@/application/use-cases/oauth-account";
import { UserUseCase } from "@/application/use-cases/user";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "@/common/constants";
import { convertRedirectableMobileScheme } from "@/common/utils/convert-redirectable-mobile-scheme";
import { oAuthProviderSchema } from "@/domain/oauth-account/provider";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { selectOAuthProviderService } from "@/infrastructure/oauth-provider";
import { OAuthAccountRepository } from "@/interface-adapter/repositories/oauth-account";
import { UserRepository } from "@/interface-adapter/repositories/user";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { getAPIBaseUrl, getMobileScheme, validateRedirectUrl } from "@mona-ca/core/utils";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";

const ProviderCallback = new ElysiaWithEnv({
	prefix: "/callback",
})
	// Route
	.get(
		"/",
		async ({ params: { provider }, cookie, env, redirect, cfModuleEnv: { DB }, query: { code, state, error } }) => {
			const { APP_ENV } = env;

			const apiBaseUrl = getAPIBaseUrl(APP_ENV === "production");
			const mobileScheme = getMobileScheme();

			const providerGatewayRedirectUrl = new URL(`auth/mobile/signup/${provider}/callback`, apiBaseUrl);

			const oAuthUseCase = new OAuthUseCase(
				selectOAuthProviderService({
					provider,
					env,
					redirectUrl: providerGatewayRedirectUrl.toString(),
				}),
			);

			const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter({ db: DB }));

			const oAuthAccountUseCase = new OAuthAccountUseCase(new OAuthAccountRepository({ db: DB }));

			const userUseCase = new UserUseCase(new UserRepository({ db: DB }));

			const stateCookieValue = cookie[OAUTH_STATE_COOKIE_NAME].value;
			const codeVerifierCookieValue = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].value;
			const redirectUrlCookieValue = validateRedirectUrl(
				mobileScheme,
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

			if (redirectUrlCookieValue === null) {
				throw new BadRequestException({ message: "Invalid redirect URL" });
			}

			if (error) {
				if (error === "access_denied") {
					redirectUrlCookieValue.searchParams.set("error", "ACCESS_DENIED");
					return redirect(convertRedirectableMobileScheme(redirectUrlCookieValue));
				}

				redirectUrlCookieValue.searchParams.set("error", "PROVIDER_ERROR");
				return redirect(convertRedirectableMobileScheme(redirectUrlCookieValue));
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
					return redirect(convertRedirectableMobileScheme(redirectUrlCookieValue));
				}

				const [existingUser, existingOAuthAccount] = await Promise.all([
					userUseCase.getUserByEmail(providerAccount.email),
					oAuthAccountUseCase.getOAuthAccountByProviderAndProviderId(provider, providerAccount.id),
				]);

				if (existingOAuthAccount) {
					redirectUrlCookieValue.searchParams.set("error", "OAUTH_ACCOUNT_ALREADY_EXISTS");
					return redirect(convertRedirectableMobileScheme(redirectUrlCookieValue));
				}

				const newUser =
					existingUser ??
					(await userUseCase.createUser({
						name: providerAccount.name,
						email: providerAccount.email,
						emailVerified: providerAccount.emailVerified,
						iconUrl: providerAccount.iconUrl,
						gender,
					}));

				const [session] = await Promise.all([
					authUseCase.createSession(newUser.id),
					oAuthAccountUseCase.createOAuthAccount({
						userId: newUser.id,
						provider,
						providerId: providerAccount.id,
					}),
				]);

				redirectUrlCookieValue.searchParams.set("access-token", session.id);

				return redirect(convertRedirectableMobileScheme(redirectUrlCookieValue));
			} catch (error) {
				console.error(error);
				redirectUrlCookieValue.searchParams.set("error", "INTERNAL_SERVER_ERROR");
				return redirect(convertRedirectableMobileScheme(redirectUrlCookieValue));
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
