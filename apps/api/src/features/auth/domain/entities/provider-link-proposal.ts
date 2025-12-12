import type { UserId } from "../../../../core/domain/value-objects";
import { TimeSpan } from "../../../../core/lib/time";
import type { IdentityProviders, IdentityProvidersUserId } from "../value-objects/identity-providers";
import type { ProviderLinkProposalId } from "../value-objects/ids";

export const PROVIDER_LINK_PROPOSAL_EXPIRES_SPAN_MINUTES = 10 as const;

export const providerLinkProposalExpiresSpan = new TimeSpan(PROVIDER_LINK_PROPOSAL_EXPIRES_SPAN_MINUTES, "m");

export interface ProviderLinkProposal {
	id: ProviderLinkProposalId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	expiresAt: Date;
}

export const createProviderLinkProposal = (args: {
	id: ProviderLinkProposalId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
}): ProviderLinkProposal => {
	return {
		id: args.id,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		email: args.email,
		provider: args.provider,
		providerUserId: args.providerUserId,
		expiresAt: new Date(Date.now() + providerLinkProposalExpiresSpan.milliseconds()),
	};
};

export const isExpiredProviderLinkProposal = (proposal: ProviderLinkProposal): boolean => {
	return proposal.expiresAt.getTime() < Date.now();
};
