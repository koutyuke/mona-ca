import { OAuthUseCase } from "@/application/use-cases/oauth";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URL_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "@/common/constants";
import { oAuthProviderSchema } from "@/domain/oauth-account/provider";
import { selectOAuthProviderGateway } from "@/interface-adapter/gateway/oauth-provider";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { BadRequestException } from "@/modules/error/exceptions";
import { getAPIBaseUrl, getMobileScheme, validateRedirectUrl } from "@mona-ca/core/utils";
import { t } from "elysia";
import { ProviderCallback } from "./callback";

const Provider = new ElysiaWithEnv({ prefix: "/:provider" })
	// Other Route
	.use(ProviderCallback)

	// Route
	.get(
		"/",
		async ({ params: { provider }, cookie, env, query: { "redirect-url": queryRedirectUrl }, redirect }) => {
			const { APP_ENV } = env;

			const apiBaseUrl = getAPIBaseUrl(APP_ENV === "production");

			const mobileScheme = getMobileScheme();

			const providerRedirectUrl = new URL(`auth/mobile/login/${provider}/callback`, apiBaseUrl);

			const oAuthProviderGateway = selectOAuthProviderGateway({
				provider,
				env,
				redirectUrl: providerRedirectUrl.toString(),
			});

			const oAuthUseCase = new OAuthUseCase(oAuthProviderGateway);

			const validatedRedirectUrl = validateRedirectUrl(mobileScheme, queryRedirectUrl ?? "/");

			if (!validatedRedirectUrl) {
				throw new BadRequestException({
					message: "Invalid redirect URL",
				});
			}

			const state = oAuthUseCase.generateState();
			const codeVerifier = oAuthUseCase.generateCodeVerifier();
			const redirectUrl = oAuthUseCase.genAuthUrl(state, codeVerifier);

			const oAuthStateCookie = cookie[OAUTH_STATE_COOKIE_NAME];
			const oAuthRedirectUrlCookie = cookie[OAUTH_REDIRECT_URL_COOKIE_NAME];
			const oAuthCodeVerifierCookie = cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME];

			oAuthStateCookie.set({
				value: state,
				path: "/",
				secure: APP_ENV === "production",
				httpOnly: true,
				sameSite: "lax",
				maxAge: 60 * 10,
			});

			oAuthCodeVerifierCookie.set({
				value: codeVerifier,
				path: "/",
				secure: APP_ENV === "production",
				httpOnly: true,
				sameSite: "lax",
				maxAge: 60 * 10,
			});

			oAuthRedirectUrlCookie.set({
				value: validatedRedirectUrl.pathname || "/",
				path: "/",
				secure: APP_ENV === "production",
				httpOnly: true,
				sameSite: "lax",
				maxAge: 60 * 10,
			});

			return redirect(redirectUrl.toString());
		},
		{
			query: t.Object({
				"redirect-url": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: oAuthProviderSchema,
			}),
			cookie: t.Cookie({
				[OAUTH_STATE_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_REDIRECT_URL_COOKIE_NAME]: t.Optional(t.String()),
			}),
		},
	);

export { Provider };
