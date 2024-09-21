import { OAuthUseCase } from "@/application/use-cases/oauth";
import { oAuthProviderSchema, selectOAuthProviderService } from "@/infrastructure/oauth-provider";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "@mona-ca/core/const";
import { getAPIBaseUrl, getWebBaseUrl, validateRedirectUri } from "@mona-ca/core/utils";
import { t } from "elysia";
import { ProviderCallback } from "./callback";

const Provider = new ElysiaWithEnv({ prefix: "/:provider" })
	// Other Route
	.use(ProviderCallback)

	// Route
	.get(
		"/",
		async ({ params: { provider }, cookie, env, query: { "redirect-uri": queryRedirectUri }, redirect }) => {
			const { APP_ENV } = env;

			const apiBaseUri = getAPIBaseUrl(APP_ENV === "production");

			const webBaseUri = getWebBaseUrl(APP_ENV === "production");

			const providerGatewayRedirectUri = new URL(`auth/web/login/${provider}/callback`, apiBaseUri);

			const oAuthUseCase = new OAuthUseCase(
				selectOAuthProviderService({
					provider,
					env,
					redirectUri: providerGatewayRedirectUri.toString(),
				}),
			);

			const validatedRedirectUri = validateRedirectUri(webBaseUri, queryRedirectUri ?? "/");

			if (!validatedRedirectUri) {
				throw new BadRequestException({
					message: "Invalid redirect URI",
				});
			}

			const state = oAuthUseCase.genState();
			const codeVerifier = oAuthUseCase.genCodeVerifier();
			const redirectUri = oAuthUseCase.genAuthUrl(state, codeVerifier);

			const oAuthStateCookie = cookie[OAUTH_STATE_COOKIE_NAME];
			const oAuthRedirectUriCookie = cookie[OAUTH_REDIRECT_URI_COOKIE_NAME];
			const oAuthCodeVerifierCookie = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME];

			oAuthStateCookie?.set({
				value: state,
				path: "/",
				secure: APP_ENV === "production",
				httpOnly: true,
				sameSite: "lax",
				maxAge: 60 * 10,
			});

			oAuthCodeVerifierCookie?.set({
				value: codeVerifier,
				path: "/",
				secure: APP_ENV === "production",
				httpOnly: true,
				sameSite: "lax",
				maxAge: 60 * 10,
			});

			oAuthRedirectUriCookie?.set({
				value: validatedRedirectUri.pathname + validatedRedirectUri.search || "/",
				path: "/",
				secure: APP_ENV === "production",
				httpOnly: true,
				sameSite: "lax",
				maxAge: 60 * 10,
			});

			redirect(redirectUri.toString());
		},
		{
			query: t.Object({
				"redirect-uri": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: oAuthProviderSchema,
			}),
		},
	);

export { Provider };
