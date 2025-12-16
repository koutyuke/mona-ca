import Elysia from "elysia";
import { ProviderLinkProposalPreviewRoute } from "./preview.route";
import { ProviderLinkProposalResendRoute } from "./resend.route";
import { ProviderLinkProposalVerifyRoute } from "./verify.route";

export const ProviderLinkProposalRoutes = new Elysia({
	prefix: "/provider-link-proposal",
})
	.use(ProviderLinkProposalResendRoute)
	.use(ProviderLinkProposalVerifyRoute)
	.use(ProviderLinkProposalPreviewRoute);
