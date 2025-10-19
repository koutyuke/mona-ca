import { getAPIBaseURL } from "@mona-ca/core/utils";
import { t } from "elysia";
import { ExternalAuthRequestUseCase } from "../../../features/auth";
import { createOAuthGateway } from "../../../features/auth/adapters/gateways/oauth-provider";
import { oauthStateSchema } from "../../../features/auth/application/use-cases/external-auth/schema";
import {
	externalIdentityProviderSchema,
	newExternalIdentityProvider,
} from "../../../features/auth/domain/value-objects/external-identity";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	RedirectResponse,
	RedirectResponseSchema,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { clientTypeSchema, newClientType } from "../../../shared/domain/value-objects";
import { HmacOAuthStateSigner } from "../../../shared/infra/crypto";
import { CookieManager } from "../../../shared/infra/elysia/cookie";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../shared/lib/http";

export const ExternalAuthSignupRequest = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(
		rateLimit("external-auth-signup-request", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.get(
		"/:provider/signup",
		async ({
			env: {
				APP_ENV,
				DISCORD_CLIENT_ID,
				DISCORD_CLIENT_SECRET,
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				OAUTH_STATE_HMAC_SECRET,
			},
			params: { provider: _provider },
			cookie,
			query: { "redirect-uri": queryRedirectURI = "/", "client-type": _clientType },
		}) => {
			// === Instances ===
			const provider = newExternalIdentityProvider(_provider);
			const clientType = newClientType(_clientType);

			const apiBaseURL = getAPIBaseURL(APP_ENV === "production");

			const providerRedirectURL = new URL(`auth/${provider}/signup/callback`, apiBaseURL);

			const cookieManager = new CookieManager(APP_ENV === "production", cookie);
			const oauthProviderGateway = createOAuthGateway(
				{
					DISCORD_CLIENT_ID,
					DISCORD_CLIENT_SECRET,
					GOOGLE_CLIENT_ID,
					GOOGLE_CLIENT_SECRET,
				},
				provider,
				providerRedirectURL.toString(),
			);

			const oauthStateSigner = new HmacOAuthStateSigner(OAUTH_STATE_HMAC_SECRET, oauthStateSchema);

			const externalAuthRequestUseCase = new ExternalAuthRequestUseCase(oauthProviderGateway, oauthStateSigner);
			// === End of instances ===

			const result = externalAuthRequestUseCase.execute(APP_ENV === "production", clientType, queryRedirectURI);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_REDIRECT_URI") {
					throw new BadRequestException({
						code: code,
						message: "Invalid redirect URI. Please check the URI and try again.",
					});
				}

				throw new BadRequestException({
					code: code,
					message: "External Auth signup request failed. Please try again.",
				});
			}

			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

			cookieManager.setCookie(OAUTH_STATE_COOKIE_NAME, state, {
				maxAge: 60 * 10,
			});

			cookieManager.setCookie(OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
				maxAge: 60 * 10,
			});

			cookieManager.setCookie(OAUTH_REDIRECT_URI_COOKIE_NAME, redirectToClientURL.toString(), {
				maxAge: 60 * 10,
			});

			return RedirectResponse(redirectToProviderURL.toString());
		},
		{
			beforeHandle: async ({ rateLimit, ip }) => {
				await rateLimit.consume(ip, 1);
			},
			query: t.Object({
				"client-type": clientTypeSchema,
				"redirect-uri": t.Optional(t.String()),
			}),
			params: t.Object({
				provider: externalIdentityProviderSchema,
			}),
			cookie: t.Cookie({
				[OAUTH_STATE_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				302: RedirectResponseSchema,
				400: ErrorResponseSchema("INVALID_REDIRECT_URI"),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-external-auth-signup-request",
				summary: "External Auth Signup Request",
				description: "External Auth Signup Request for the provider",
				tag: "Auth - External Auth",
			}),
		},
	);
