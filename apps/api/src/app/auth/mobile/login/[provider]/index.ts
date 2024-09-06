import { OAuthUseCase } from "@/application/use-cases/oauth";
import { providerSchema, selectOAuthProviderGateway } from "@/interface-adapter/gateway/oauth-provider";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "@mona-ca/core/const";
import { getAPIBaseUrl, getMobileScheme, validateRedirectUri } from "@mona-ca/core/utils";
import { t } from "elysia";
import { ProviderCallback } from "./callback";

const Provider = new ElysiaWithEnv({ prefix: "/:provider" })
	.get(
		"/",
		async ({ params: { provider }, cookie, env, query: { "redirect-uri": queryRedirectUri }, set }) => {
			const { APP_ENV } = env;

			const apiBaseUri = getAPIBaseUrl(APP_ENV === "production");

			const mobileScheme = getMobileScheme();

			const providerGatewayRedirectUri = new URL(`auth/mobile/login/${provider}/callback`, apiBaseUri);

			const oAuthUseCase = new OAuthUseCase(
				selectOAuthProviderGateway({
					provider,
					env,
					redirectUri: providerGatewayRedirectUri.toString(),
				}),
			);

			const validatedRedirectUri = validateRedirectUri(mobileScheme, queryRedirectUri ?? "/");

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
				value: validatedRedirectUri.pathname || "/",
				path: "/",
				secure: APP_ENV === "production",
				httpOnly: true,
				sameSite: "lax",
				maxAge: 60 * 10,
			});

			set.redirect = redirectUri.toString();
		},
		{
			query: t.Object({
				"redirect-uri": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: providerSchema,
			}),
		},
	)
	.use(ProviderCallback);

export { Provider };
