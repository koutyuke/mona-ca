import type { UserId } from "../../../../../../core/domain/value-objects";
import type { ProviderLinkProposal } from "../../../../domain/entities/provider-link-proposal";
import type { ProviderLinkProposalId } from "../../../../domain/value-objects/ids";

export interface IProviderLinkProposalRepository {
	findById(id: ProviderLinkProposalId): Promise<ProviderLinkProposal | null>;

	save(proposal: ProviderLinkProposal): Promise<void>;

	deleteById(id: ProviderLinkProposalId): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredProposals(): Promise<void>;
}
