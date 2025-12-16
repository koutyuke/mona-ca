import { PROVIDER_LINK_PROPOSAL_COOKIE_NAME, SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { newProviderLinkProposalToken, toAnyTokenResponse } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi/path-detail";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const ProviderLinkProposalVerifyRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())
	.use(
		ratelimitPlugin("provider-link-proposal-verify", {
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
	.post(
		"/verify",
		async ({
			cookie,
			body: { providerLinkProposalToken: bodyProviderLinkProposalToken, code },
			clientPlatform,
			rateLimit,
			containers,
			status,
		}) => {
			const rawProviderLinkProposalToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[PROVIDER_LINK_PROPOSAL_COOKIE_NAME].value)
				.when(isMobilePlatform, () => bodyProviderLinkProposalToken)
				.exhaustive();

			if (!rawProviderLinkProposalToken) {
				return status("Unauthorized", {
					code: "PROVIDER_LINK_PROPOSAL_INVALID",
					message: "Provider link proposal not found.",
				});
			}

			const providerLinkProposalToken = newProviderLinkProposalToken(rawProviderLinkProposalToken);

			const validateResult =
				await containers.auth.providerLinkValidateProposalUseCase.execute(providerLinkProposalToken);

			if (validateResult.isErr) {
				return match(validateResult)
					.with({ code: "INVALID_PROVIDER_LINK_PROPOSAL" }, ({ code }) => {
						return status("Unauthorized", {
							code,
							message: "Invalid provider link proposal.",
						});
					})
					.with({ code: "EXPIRED_PROVIDER_LINK_PROPOSAL" }, ({ code }) => {
						return status("Unauthorized", {
							code,
							message: "Provider link proposal has expired.",
						});
					})
					.exhaustive();
			}

			const { providerLinkProposal, userCredentials } = validateResult.value;

			const ratelimitResult = await rateLimit.consume(userCredentials.id, 100);
			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const verifyEmailResult = await containers.auth.providerLinkProposalVerifyEmailUseCase.execute(
				code,
				userCredentials,
				providerLinkProposal,
			);

			if (verifyEmailResult.isErr) {
				return match(verifyEmailResult)
					.with({ code: "INVALID_CODE" }, ({ code }) => {
						return status("Bad Request", {
							code,
							message: "Invalid code. Please check your email and try again.",
						});
					})
					.with({ code: "PROVIDER_ALREADY_LINKED" }, ({ code }) => {
						return status("Bad Request", {
							code,
							message: "This provider is already linked to your account. Please login with this provider.",
						});
					})
					.with({ code: "ACCOUNT_LINKED_ELSEWHERE" }, ({ code }) => {
						return status("Bad Request", {
							code,
							message: "This provider account is already linked to another user. Please login with this provider.",
						});
					})
					.exhaustive();
			}

			const { sessionToken, session } = verifyEmailResult.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					sessionToken: toAnyTokenResponse(sessionToken),
				};
			}

			cookie[PROVIDER_LINK_PROPOSAL_COOKIE_NAME].remove();
			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: sessionToken,
				expires: session.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[PROVIDER_LINK_PROPOSAL_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				providerLinkProposalToken: t.Optional(t.String()),
				code: t.String(),
			}),
			detail: pathDetail({
				tag: "Auth - Provider Link Proposal",
				operationId: "provider-link-proposal-verify",
				summary: "Provider Link Proposal Verify",
				description: "Provider Link Proposal Verify endpoint for the User",
			}),
		},
	);
