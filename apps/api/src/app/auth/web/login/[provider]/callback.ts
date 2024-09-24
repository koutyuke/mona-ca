import { AuthUseCase } from "@/application/use-cases/auth";
import { OAuthUseCase } from "@/application/use-cases/oauth";
import { OAuthAccountUseCase } from "@/application/use-cases/oauth-account";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "@/common/constants";
import { oAuthProviderSchema } from "@/domain/oauth-account/provider";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { selectOAuthProviderService } from "@/infrastructure/oauth-provider";
import { OAuthAccountRepository } from "@/interface-adapter/repositories/oauth-account";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { getAPIBaseUrl, getWebBaseUrl, validateRedirectUrl } from "@mona-ca/core/utils";
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
			const webBaseUrl = getWebBaseUrl(APP_ENV === "production");

			const providerGatewayRedirectUrl = new URL(`auth/web/login/${provider}/callback`, apiBaseUrl);

			const oAuthUseCase = new OAuthUseCase(
				selectOAuthProviderService({
					provider,
					env,
					redirectUrl: providerGatewayRedirectUrl.toString(),
				}),
			);

			const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter({ db: DB }));

			const oAuthAccountUseCase = new OAuthAccountUseCase(new OAuthAccountRepository({ db: DB }));

			const stateCookieValue = cookie[OAUTH_STATE_COOKIE_NAME].value;
			const codeVerifierCookieValue = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].value;
			const redirectUrlCookieValue = validateRedirectUrl(
				webBaseUrl,
				cookie[OAUTH_REDIRECT_URL_COOKIE_NAME].value ?? "/",
			);

			if (!stateCookieValue || !redirectUrlCookieValue) {
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

				const existingOAuthAccount = await oAuthAccountUseCase.getOAuthAccountByProviderAndProviderId(
					provider,
					providerAccount.id,
				);

				if (!existingOAuthAccount) {
					redirectUrlCookieValue.searchParams.set("error", "ACCOUNT_NOT_FOUND");
					return redirect(redirectUrlCookieValue.toString());
				}

				const session = await authUseCase.createSession(existingOAuthAccount.userId);
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
			}),
		},
	);

export { ProviderCallback };
