import { PROVIDER_LINK_PROPOSAL_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, status, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { newProviderLinkProposalToken, toAnyTokenResponse } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi/path-detail";
import { ratelimitPlugin } from "../../../plugins/ratelimit";

export const ProviderLinkProposalResendRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(
		ratelimitPlugin("provider-link-proposal-resend", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.use(clientPlatformPlugin())
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
		"/resend",
		async ({ containers, cookie, body, clientPlatform, rateLimit }) => {
			const rawProviderLinkProposalToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[PROVIDER_LINK_PROPOSAL_COOKIE_NAME].value)
				.when(isMobilePlatform, () => body?.providerLinkProposalToken)
				.exhaustive();

			if (!rawProviderLinkProposalToken) {
				return status("Unauthorized", {
					code: "PROVIDER_LINK_PROPOSAL_INVALID",
					message: "Provider link proposal not found. Please login again.",
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
							message: "Invalid provider link proposal. Please login again.",
						});
					})
					.with({ code: "EXPIRED_PROVIDER_LINK_PROPOSAL" }, ({ code }) => {
						return status("Unauthorized", {
							code,
							message: "Provider link proposal has expired. Please login again.",
						});
					})
					.exhaustive();
			}

			const { providerLinkProposal } = validateResult.value;

			const ratelimitResult = await rateLimit.consume(providerLinkProposal.userId, 100);

			if (ratelimitResult.isErr) {
				return status("Too Many Requests", {
					code: "TOO_MANY_REQUESTS",
					message: "Too many requests. Please try again later.",
				});
			}

			const result = await containers.auth.providerLinkProposalReissueUseCase.execute(providerLinkProposal);
			const {
				providerLinkProposalToken: reissueProviderLinkProposalToken,
				providerLinkProposal: reissueProviderLinkProposal,
			} = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					providerLinkProposalToken: toAnyTokenResponse(reissueProviderLinkProposalToken),
				};
			}

			cookie[PROVIDER_LINK_PROPOSAL_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(reissueProviderLinkProposalToken),
				expires: reissueProviderLinkProposal.expiresAt,
			});

			return noContent();
		},
		{
			cookie: t.Cookie({
				[PROVIDER_LINK_PROPOSAL_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Optional(
				t.Object({
					providerLinkProposalToken: t.Optional(t.String()),
				}),
			),
			detail: pathDetail({
				tag: "Auth - Provider Link Proposal",
				operationId: "provider-link-proposal-resend-email",
				summary: "Provider Link Proposal Resend Email",
				description: "Provider Link Proposal Resend Email endpoint for the User",
			}),
		},
	);
