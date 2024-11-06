import { OAuthRequestUseCase } from "@/application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME,
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
	[OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME]: t.Optional(
		t.Object({
			gender: t.Optional(t.Union([t.Literal("man"), t.Literal("woman")])),
		}),
	),
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
			env: { APP_ENV, ...otherEnv },
			params: { provider, client },
			cookie,
			query: { "redirect-url": queryRedirectUrl = "/", gender = "man" },
			redirect,
		}) => {
			const apiBaseUrl = getAPIBaseUrl(APP_ENV === "production");
			const clientBaseUrl = client === "web" ? getWebBaseUrl(APP_ENV === "production") : getMobileScheme();

			const providerRedirectUrl = new URL(`auth/${client}/signup/${provider}/callback`, apiBaseUrl);

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

			cookieService.setCookie(
				OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME,
				{
					gender,
				},
				{
					maxAge: 60 * 10,
				},
			);

			return redirect(redirectToProviderUrl.toString());
		},
		{
			query: t.Object({
				"redirect-url": t.Optional(t.String()),
				gender: t.Optional(t.Union([t.Literal("man"), t.Literal("woman")])),
			}),
			params: t.Object({
				client: t.Union([t.Literal("web"), t.Literal("mobile")]),
				provider: oAuthProviderSchema,
			}),
			cookie: t.Cookie(cookieSchemaObject),
		},
	);