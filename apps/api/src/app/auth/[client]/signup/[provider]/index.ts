import { getAPIBaseUrl, getMobileScheme, getWebBaseUrl } from "@mona-ca/core/utils";
import { t } from "elysia";
import { OAuthRequestUseCase } from "../../../../../application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../../../common/constants";
import { clientSchema } from "../../../../../common/schema";
import { isErr } from "../../../../../common/utils";
import { newOAuthProvider, oauthProviderSchema } from "../../../../../domain/value-object";
import { genderSchema } from "../../../../../domain/value-object";
import { OAuthProviderGateway } from "../../../../../interface-adapter/gateway/oauth-provider";
import { CookieService } from "../../../../../modules/cookie";
import { ElysiaWithEnv } from "../../../../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorException } from "../../../../../modules/error";
import { rateLimiter } from "../../../../../modules/rate-limiter";
import { ProviderCallback } from "./callback";

const cookieSchemaObject = {
	[OAUTH_STATE_COOKIE_NAME]: t.Optional(t.String()),
	[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.Optional(t.String()),
	[OAUTH_REDIRECT_URL_COOKIE_NAME]: t.Optional(t.String()),
	[OAUTH_OPTIONAL_ACCOUNT_INFO_COOKIE_NAME]: t.Optional(
		t.Object({
			gender: t.Optional(genderSchema),
		}),
	),
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
			env: { APP_ENV, ...otherEnv },
			params: { provider: _provider, client },
			cookie,
			query: { "redirect-url": queryRedirectUrl = "/", gender = "man" },
			redirect,
		}) => {
			const provider = newOAuthProvider(_provider);
			const apiBaseUrl = getAPIBaseUrl(APP_ENV === "production");
			const clientBaseUrl = client === "web" ? getWebBaseUrl(APP_ENV === "production") : getMobileScheme();

			const providerRedirectUrl = new URL(`auth/${client}/signup/${provider}/callback`, apiBaseUrl);

			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const oauthProviderGateway = OAuthProviderGateway({
				provider,
				env: otherEnv,
				redirectUrl: providerRedirectUrl.toString(),
			});

			const oauthRequestUseCase = new OAuthRequestUseCase(oauthProviderGateway);

			const result = oauthRequestUseCase.execute(clientBaseUrl, queryRedirectUrl);

			if (isErr(result)) {
				const { code } = result;
				switch (code) {
					case "INVALID_REDIRECT_URL":
						throw new BadRequestException({
							name: code,
							message: "Invalid redirect URL.",
						});
					default:
						throw new InternalServerErrorException({
							message: "Unknown OAuthRequestUseCase error result.",
						});
				}
			}

			const { state, codeVerifier, redirectToClientUrl, redirectToProviderUrl } = result;

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
			beforeHandle: async ({ rateLimiter, ip }) => {
				await rateLimiter.consume(ip, 1);
			},
			query: t.Object({
				"redirect-url": t.Optional(t.String()),
				gender: t.Optional(genderSchema),
			}),
			params: t.Object({
				client: clientSchema,
				provider: oauthProviderSchema,
			}),
			cookie: t.Cookie(cookieSchemaObject),
		},
	);
