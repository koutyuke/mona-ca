import type { UserId } from "../../../../../../core/domain/value-objects";
import type { AccountLinkProposal } from "../../../../domain/entities/account-link-proposal";
import type { AccountLinkProposalId } from "../../../../domain/value-objects/ids";

export interface IAccountLinkProposalRepository {
	findById(id: AccountLinkProposalId): Promise<AccountLinkProposal | null>;

	save(proposal: AccountLinkProposal): Promise<void>;

	deleteById(id: AccountLinkProposalId): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredProposals(): Promise<void>;
}
