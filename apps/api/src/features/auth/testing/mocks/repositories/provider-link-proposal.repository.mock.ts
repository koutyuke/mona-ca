import type { UserId } from "../../../../../core/domain/value-objects";
import type { IProviderLinkProposalRepository } from "../../../application/ports/out/repositories/provider-link-proposal.repository.interface";
import {
	type ProviderLinkProposal,
	isExpiredProviderLinkProposal,
} from "../../../domain/entities/provider-link-proposal";
import type { ProviderLinkProposalId } from "../../../domain/value-objects/ids";

export class ProviderLinkProposalRepositoryMock implements IProviderLinkProposalRepository {
	private readonly providerLinkProposalMap: Map<ProviderLinkProposalId, ProviderLinkProposal>;

	constructor(maps: { providerLinkProposalMap: Map<ProviderLinkProposalId, ProviderLinkProposal> }) {
		this.providerLinkProposalMap = maps.providerLinkProposalMap;
	}

	async findById(id: ProviderLinkProposalId): Promise<ProviderLinkProposal | null> {
		return this.providerLinkProposalMap.get(id) || null;
	}

	async save(proposal: ProviderLinkProposal): Promise<void> {
		this.providerLinkProposalMap.set(proposal.id, proposal);
	}

	async deleteById(id: ProviderLinkProposalId): Promise<void> {
		this.providerLinkProposalMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [proposalId, proposal] of this.providerLinkProposalMap.entries()) {
			if (proposal.userId === userId) {
				this.providerLinkProposalMap.delete(proposalId);
			}
		}
	}

	async deleteExpiredProposals(): Promise<void> {
		for (const [proposalId, proposal] of this.providerLinkProposalMap.entries()) {
			if (isExpiredProviderLinkProposal(proposal)) {
				this.providerLinkProposalMap.delete(proposalId);
			}
		}
	}
}
