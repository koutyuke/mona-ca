import { AuthUseCase } from "@/application/use-cases/auth";
import { OAuthUseCase } from "@/application/use-cases/oauth";
import { OAuthAccountUseCase } from "@/application/use-cases/oauth-account";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "@/common/constants";
import { convertRedirectableMobileScheme } from "@/common/utils/convert-redirectable-mobile-scheme";
import { oAuthProviderSchema } from "@/domain/oauth-account/provider";
import { DrizzleService } from "@/infrastructure/drizzle";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { selectOAuthProviderGateway } from "@/interface-adapter/gateway/oauth-provider";
import { OAuthAccountRepository } from "@/interface-adapter/repositories/oauth-account";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { getAPIBaseUrl, getMobileScheme, validateRedirectUrl } from "@mona-ca/core/utils";
import { t } from "elysia";

const ProviderCallback = new ElysiaWithEnv({
	prefix: "/callback",
})
	// Route
	.get(
		"/",
		async ({
			params: { provider },
			cookie,
			env,
			set,
			cfModuleEnv: { DB },
			query: { code, state, error },
			redirect,
		}) => {
			const { APP_ENV } = env;

			const apiBaseUrl = getAPIBaseUrl(APP_ENV === "production");
			const mobileScheme = getMobileScheme();

			const providerGatewayRedirectUrl = new URL(`auth/mobile/login/${provider}/callback`, apiBaseUrl);

			const drizzleService = new DrizzleService(DB);

			const oAuthUseCase = new OAuthUseCase(
				selectOAuthProviderGateway({
					provider,
					env,
					redirectUrl: providerGatewayRedirectUrl.toString(),
				}),
			);
			const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter(drizzleService));
			const oAuthAccountUseCase = new OAuthAccountUseCase(new OAuthAccountRepository(drizzleService));

			const stateCookieValue = cookie[OAUTH_STATE_COOKIE_NAME].value;
			const codeVerifierCookieValue = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].value;
			const redirectUrlCookieValue = validateRedirectUrl(
				mobileScheme,
				cookie[OAUTH_REDIRECT_URL_COOKIE_NAME].value ?? "/",
			);

			if (!redirectUrlCookieValue) {
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

				const existingOAuthAccount = await oAuthAccountUseCase.getOAuthAccountByProviderAndProviderId(
					provider,
					providerAccount.id,
				);

				if (!existingOAuthAccount) {
					redirectUrlCookieValue.searchParams.set("error", "ACCOUNT_NOT_FOUND");
					return redirect(convertRedirectableMobileScheme(redirectUrlCookieValue));
				}

				const session = await authUseCase.createSession(existingOAuthAccount.userId);

				redirectUrlCookieValue.searchParams.set("access-token", session.id);

				set.headers["Referrer-Policy"] = "strict-origin";
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
			}),
		},
	);

export { ProviderCallback };
