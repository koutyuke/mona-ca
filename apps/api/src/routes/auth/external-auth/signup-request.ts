import { Elysia, redirect, t } from "elysia";
import { clientTypeSchema, newClientType } from "../../../core/domain/value-objects";
import { env } from "../../../core/infra/config/env";
import { defaultCookieOptions } from "../../../core/infra/elysia";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "../../../core/lib/http";
import { externalIdentityProviderSchema, newExternalIdentityProvider } from "../../../features/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const ExternalAuthSignupRequest = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		ratelimitPlugin("external-auth-signup-request", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.onBeforeHandle(async ({ rateLimit, ipAddress, status }) => {
		const result = await rateLimit.consume(ipAddress, 1);
		if (result.isErr) {
			return status("Too Many Requests", {
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests. Please try again later.",
			});
		}
		return;
	})

	// Route
	.get(
		"/:provider/signup",
		async ({
			containers,
			params: { provider: _provider },
			cookie,
			query: { "redirect-uri": queryRedirectURI = "/", "client-type": _clientType },
			status,
		}) => {
			const provider = newExternalIdentityProvider(_provider);
			const clientType = newClientType(_clientType);

			const result = containers.auth.externalAuthSignupRequestUseCase.execute(
				env.APP_ENV === "production",
				clientType,
				provider,
				queryRedirectURI,
			);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_REDIRECT_URI") {
					return status("Bad Request", {
						code: code,
						message: "Invalid redirect URI. Please check the URI and try again.",
					});
				}

				return status("Bad Request", {
					code: code,
					message: "External Auth signup request failed. Please try again.",
				});
			}

			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

			cookie[OAUTH_STATE_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: state,
				maxAge: 60 * 10,
			});

			cookie[OAUTH_CODE_VERIFIER_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: codeVerifier,
				maxAge: 60 * 10,
			});

			cookie[OAUTH_REDIRECT_URI_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: redirectToClientURL.toString(),
				maxAge: 60 * 10,
			});

			return redirect(redirectToProviderURL.toString());
		},
		{
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
			detail: pathDetail({
				operationId: "auth-external-auth-signup-request",
				summary: "External Auth Signup Request",
				description: "External Auth Signup Request for the provider",
				tag: "Auth - External Auth",
			}),
		},
	);
