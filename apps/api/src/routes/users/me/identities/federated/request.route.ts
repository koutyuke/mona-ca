import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_REDIRECT_URI_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
} from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { clientPlatformSchema, newClientPlatform } from "../../../../../core/domain/value-objects";
import { env } from "../../../../../core/infra/config/env";
import { defaultCookieOptions, redirect } from "../../../../../core/infra/elysia";
import { identityProvidersSchema, newIdentityProviders } from "../../../../../features/auth";
import { newProviderLinkRequestToken } from "../../../../../features/auth/domain/value-objects/tokens";
import { containerPlugin } from "../../../../../plugins/container";
import { pathDetail } from "../../../../../plugins/openapi";
import { ratelimitPlugin } from "../../../../../plugins/ratelimit";

export const ProviderLinkRequestRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		ratelimitPlugin("provider-link-request", {
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
		"/:provider/link",
		async ({
			cookie,
			params: { provider: _provider },
			query: {
				platform: _clientPlatform = "web",
				"redirect-uri": queryRedirectURI = "/",
				"link-token": _providerLinkRequestToken,
			},
			headers,
			containers,
			status,
		}) => {
			const provider = newIdentityProviders(_provider);
			const clientPlatform = newClientPlatform(_clientPlatform);

			const providerLinkRequestToken = _providerLinkRequestToken
				? newProviderLinkRequestToken(_providerLinkRequestToken)
				: null;

			if (!providerLinkRequestToken) {
				return status("Unauthorized", {
					code: "UNAUTHORIZED" as const,
					message: "It looks like you are not authenticated. Please login to continue.",
				});
			}

			const validationResult = await containers.auth.providerLinkValidateRequestUseCase.execute(
				provider,
				providerLinkRequestToken,
			);

			if (validationResult.isErr) {
				return match(validationResult)
					.with({ code: "INVALID_PROVIDER_LINK_REQUEST" }, ({ code }) =>
						status("Unauthorized", {
							code,
							message: "It looks like the provider link request is invalid. Please try again.",
						}),
					)
					.exhaustive();
			}
			const { userCredentials } = validationResult.value;

			const providerLinkRequestResult = await containers.auth.providerLinkRequestUseCase.execute(
				env.APP_ENV === "production",
				clientPlatform,
				provider,
				queryRedirectURI,
				userCredentials,
			);

			if (providerLinkRequestResult.isErr) {
				return match(providerLinkRequestResult)
					.with({ code: "INVALID_REDIRECT_URI" }, ({ code }) =>
						status("Bad Request", {
							code,
							message: "Invalid redirect URI. Please check the URI and try again.",
						}),
					)
					.exhaustive();
			}

			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = providerLinkRequestResult.value;

			headers["referrer-policy"] = "no-referrer";
			headers["cache-control"] = "no-cache";

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
			beforeHandle: async ({ rateLimit, ipAddress, status }) => {
				const result = await rateLimit.consume(ipAddress, 1);
				if (result.isErr) {
					return status("Too Many Requests", {
						code: "TOO_MANY_REQUESTS",
						message: "Too many requests. Please try again later.",
					});
				}
				return;
			},
			query: t.Object({
				platform: t.Optional(clientPlatformSchema),
				"link-token": t.Optional(t.String()),
				"redirect-uri": t.Optional(t.String()),
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
				operationId: "me-provider-link-request",
				summary: "Provider Link Request",
				description: "Provider Link Request for the provider",
				tag: "Me - Provider Link",
				withAuth: true,
			}),
		},
	);
