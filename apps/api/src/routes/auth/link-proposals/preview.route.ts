import { PROVIDER_LINK_PROPOSAL_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { newProviderLinkProposalToken, toAccountLinkPreviewResponse } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi/path-detail";

export const ProviderLinkProposalPreviewRoute = new Elysia()
	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())

	// Route
	.post(
		"/preview",
		async ({ containers, cookie, body, clientPlatform, status }) => {
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

			const validationResult =
				await containers.auth.providerLinkValidateProposalUseCase.execute(providerLinkProposalToken);

			if (validationResult.isErr) {
				return match(validationResult)
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

			const { providerLinkProposal } = validationResult.value;

			return toAccountLinkPreviewResponse(providerLinkProposal);
		},
		{
			cookie: t.Cookie({
				[PROVIDER_LINK_PROPOSAL_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				providerLinkProposalToken: t.Optional(t.String()),
			}),
			detail: pathDetail({
				tag: "Auth - Provider Link Proposal",
				operationId: "auth-provider-link-proposal-preview",
				summary: "Provider Link Proposal Preview",
				description: "Preview the provider link proposal",
			}),
		},
	);
