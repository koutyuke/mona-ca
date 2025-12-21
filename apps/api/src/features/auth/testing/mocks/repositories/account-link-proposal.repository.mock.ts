import type { UserId } from "../../../../../core/domain/value-objects";
import type { IAccountLinkProposalRepository } from "../../../application/ports/out/repositories/account-link-proposal.repository.interface";
import { type AccountLinkProposal, isExpiredAccountLinkProposal } from "../../../domain/entities/account-link-proposal";
import type { AccountLinkProposalId } from "../../../domain/value-objects/ids";

export class AccountLinkProposalRepositoryMock implements IAccountLinkProposalRepository {
	private readonly accountLinkProposalMap: Map<AccountLinkProposalId, AccountLinkProposal>;

	constructor(maps: { providerLinkProposalMap: Map<AccountLinkProposalId, AccountLinkProposal> }) {
		this.accountLinkProposalMap = maps.providerLinkProposalMap;
	}

	async findById(id: AccountLinkProposalId): Promise<AccountLinkProposal | null> {
		return this.accountLinkProposalMap.get(id) || null;
	}

	async save(proposal: AccountLinkProposal): Promise<void> {
		this.accountLinkProposalMap.set(proposal.id, proposal);
	}

	async deleteById(id: AccountLinkProposalId): Promise<void> {
		this.accountLinkProposalMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [proposalId, proposal] of this.accountLinkProposalMap.entries()) {
			if (proposal.userId === userId) {
				this.accountLinkProposalMap.delete(proposalId);
			}
		}
	}

	async deleteExpiredProposals(): Promise<void> {
		for (const [proposalId, proposal] of this.accountLinkProposalMap.entries()) {
			if (isExpiredAccountLinkProposal(proposal)) {
				this.accountLinkProposalMap.delete(proposalId);
			}
		}
	}
}
