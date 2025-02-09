import { getAPIBaseUrl, getMobileScheme, getWebBaseUrl } from "@mona-ca/core/utils";
import { t } from "elysia";
import { OAuthRequestUseCase } from "../../../../../application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../../../common/constants";
import { clientSchema } from "../../../../../common/schema";
import { selectOAuthProviderGateway } from "../../../../../interface-adapter/gateway/oauth-provider";
import { oAuthProviderSchema } from "../../../../../models/entities/oauth-account";
import { CookieService } from "../../../../../models/services/cookie";
import { ElysiaWithEnv } from "../../../../../modules/elysia-with-env";
import { rateLimiter } from "../../../../../modules/rate-limiter";
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

	// Local Middleware & Plugin
	.use(
		rateLimiter("oauth-provider", {
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
			beforeHandle: async ({ rateLimiter, set, ip }) => {
				const { success, reset } = await rateLimiter.consume(ip, 1);
				if (!success) {
					set.status = 429;
					return {
						name: "TooManyRequests",
						resetTime: reset,
					};
				}
				return;
			},
			query: t.Object({
				"redirect-url": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: oAuthProviderSchema,
				client: clientSchema,
			}),
			cookie: t.Cookie(cookieSchemaObject),
		},
	);
