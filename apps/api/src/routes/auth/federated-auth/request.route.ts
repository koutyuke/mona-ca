import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { clientPlatformSchema, newClientPlatform } from "../../../core/domain/value-objects";
import { env } from "../../../core/infra/config/env";
import { defaultCookieOptions, redirect } from "../../../core/infra/elysia";
import { identityProvidersSchema, newIdentityProviders } from "../../../features/auth";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const FederatedAuthRequestRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		ratelimitPlugin("federated-auth-request", {
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
		"/:provider",
		async ({
			params: { provider: _provider },
			cookie,
			query: { "redirect-uri": queryRedirectURI = "/", platform: _clientPlatform },
			containers,
			status,
		}) => {
			const provider = newIdentityProviders(_provider);
			const clientPlatform = newClientPlatform(_clientPlatform);

			const result = containers.auth.federatedAuthRequestUseCase.execute(
				env.APP_ENV === "production",
				clientPlatform,
				provider,
				queryRedirectURI,
			);

			if (result.isErr) {
				return match(result)
					.with({ code: "INVALID_REDIRECT_URI" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "Invalid redirect URI. Please check the URI and try again.",
						}),
					)
					.exhaustive();
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
				"redirect-uri": t.Optional(t.String()),
				platform: clientPlatformSchema,
			}),
			params: t.Object({
				provider: identityProvidersSchema,
			}),
			cookie: t.Cookie({
				[OAUTH_STATE_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_CODE_VERIFIER_COOKIE_NAME]: t.Optional(t.String()),
				[OAUTH_REDIRECT_URI_COOKIE_NAME]: t.Optional(t.String()),
			}),
			detail: pathDetail({
				operationId: "auth-federated-auth-request",
				summary: "Federated Auth Request",
				description: "Federated Auth Request for the provider",
				tag: "Auth - Federated Auth",
			}),
		},
	);
