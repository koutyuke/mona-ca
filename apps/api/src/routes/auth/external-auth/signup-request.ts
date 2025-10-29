import { Elysia, t } from "elysia";
import { clientTypeSchema, newClientType } from "../../../core/domain/value-objects";
import { env } from "../../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	RedirectResponse,
	RedirectResponseSchema,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../core/lib/http";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../features/auth";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/openapi";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";

export const ExternalAuthSignupRequest = new Elysia()
	// Local Middleware & Plugin
	.use(di())
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
			containers,
			params: { provider: _provider },
			cookie,
			query: { "redirect-uri": queryRedirectURI = "/", "client-type": _clientType },
		}) => {
			const provider = newExternalIdentityProvider(_provider);
			const clientType = newClientType(_clientType);

			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const result = containers.auth.externalAuthSignupRequestUseCase.execute(
				env.APP_ENV === "production",
				clientType,
				provider,
				queryRedirectURI,
			);

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
