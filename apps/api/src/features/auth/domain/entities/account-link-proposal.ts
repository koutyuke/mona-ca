import type { UserId } from "../../../../core/domain/value-objects";
import { TimeSpan } from "../../../../core/lib/time";
import type { IdentityProviders, IdentityProvidersUserId } from "../value-objects/identity-providers";
import type { AccountLinkProposalId } from "../value-objects/ids";

export const ACCOUNT_LINK_PROPOSAL_EXPIRES_SPAN_MINUTES = 10 as const;

export const accountLinkProposalExpiresSpan = new TimeSpan(ACCOUNT_LINK_PROPOSAL_EXPIRES_SPAN_MINUTES, "m");

export interface AccountLinkProposal {
	id: AccountLinkProposalId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	expiresAt: Date;
}

export const createAccountLinkProposal = (args: {
	id: AccountLinkProposalId;
	userId: UserId;
	code: string | null;
	secretHash: Uint8Array;
	email: string;
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
}): AccountLinkProposal => {
	return {
		id: args.id,
		userId: args.userId,
		code: args.code,
		secretHash: args.secretHash,
		email: args.email,
		provider: args.provider,
		providerUserId: args.providerUserId,
		expiresAt: new Date(Date.now() + accountLinkProposalExpiresSpan.milliseconds()),
	};
};

export const isExpiredAccountLinkProposal = (proposal: AccountLinkProposal): boolean => {
	return proposal.expiresAt.getTime() < Date.now();
};
