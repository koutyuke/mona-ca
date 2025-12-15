import type { ProviderLinkProposal } from "../../domain/entities/provider-link-proposal";
import type { RawIdentityProviders } from "../../domain/value-objects/identity-providers";

type AccountLinkPreviewResponse = {
	email: string;
	provider: RawIdentityProviders;
	providerId: string;
};

export const toAccountLinkPreviewResponse = (
	providerLinkProposal: ProviderLinkProposal,
): AccountLinkPreviewResponse => {
	return {
		email: providerLinkProposal.email,
		provider: providerLinkProposal.provider,
		providerId: providerLinkProposal.providerUserId,
	};
};
