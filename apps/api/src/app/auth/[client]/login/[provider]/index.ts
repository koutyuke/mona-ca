import { OAuthRequestUseCase } from "@/application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "@/common/constants";
import { oAuthProviderSchema } from "@/domain/oauth-account/provider";
import { selectOAuthProviderGateway } from "@/interface-adapter/gateway/oauth-provider";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { CookieService } from "@/services/cookie";
import { getAPIBaseUrl, getMobileScheme, getWebBaseUrl } from "@mona-ca/core/utils";
import { t } from "elysia";
import { ProviderCallback } from "./callback";

const cookieSchemaObject = {
	[OAUTH_STATE_COOKIE_NAME]: t.Optional(t.String()),
	[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.Optional(t.String()),
	[OAUTH_REDIRECT_URL_COOKIE_NAME]: t.Optional(t.String()),
};

export const Provider = new ElysiaWithEnv({
	prefix: "/:provider",
})
	// Other Route
	.use(ProviderCallback)

	// Route
	.get(
		"/",
		async ({
			params: { provider, client },
			cookie,
			env: { APP_ENV, ...otherEnv },
			query: { "redirect-url": queryRedirectUrl = "/" },
			redirect,
		}) => {
			const apiBaseUrl = getAPIBaseUrl(APP_ENV === "production");
			const clientBaseUrl = client === "web" ? getWebBaseUrl(APP_ENV === "production") : getMobileScheme();

			const providerRedirectUrl = new URL(`auth/${client}/login/${provider}/callback`, apiBaseUrl);

			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const oAuthProviderGateway = selectOAuthProviderGateway({
				provider,
				env: otherEnv,
				redirectUrl: providerRedirectUrl.toString(),
			});

			const oAuthRequestUseCase = new OAuthRequestUseCase(oAuthProviderGateway);

			const { state, codeVerifier, redirectToClientUrl, redirectToProviderUrl } = oAuthRequestUseCase.execute(
				clientBaseUrl,
				queryRedirectUrl,
			);

			cookieService.setCookie(OAUTH_STATE_COOKIE_NAME, state, {
				maxAge: 60 * 10,
			});

			cookieService.setCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
				maxAge: 60 * 10,
			});

			cookieService.setCookie(OAUTH_REDIRECT_URL_COOKIE_NAME, redirectToClientUrl.toString(), {
				maxAge: 60 * 10,
			});

			return redirect(redirectToProviderUrl.toString());
		},
		{
			query: t.Object({
				"redirect-url": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: oAuthProviderSchema,
				client: t.Union([t.Literal("web"), t.Literal("mobile")]),
			}),
			cookie: t.Cookie(cookieSchemaObject),
		},
	);
