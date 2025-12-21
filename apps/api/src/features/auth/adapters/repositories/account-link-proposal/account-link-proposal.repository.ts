import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import { newAccountLinkProposalId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IAccountLinkProposalRepository } from "../../../application/ports/out/repositories/account-link-proposal.repository.interface";
import type { AccountLinkProposal } from "../../../domain/entities/account-link-proposal";
import type { RawIdentityProviders } from "../../../domain/value-objects/identity-providers";
import type { AccountLinkProposalId } from "../../../domain/value-objects/ids";

interface FoundAccountLinkProposalDto {
	id: string;
	userId: string;
	code: string | null;
	secretHash: Buffer;
	email: string;
	provider: RawIdentityProviders;
	providerUserId: string;
	expiresAt: Date;
}

export class AccountLinkProposalRepository implements IAccountLinkProposalRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(proposalId: AccountLinkProposalId): Promise<AccountLinkProposal | null> {
		const proposals = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.accountLinkProposalsTable)
			.where(eq(this.drizzleService.schema.accountLinkProposalsTable.id, proposalId));

		if (proposals.length > 1) {
			throw new Error("Multiple proposals found for the same proposal id");
		}

		return proposals.length === 1 ? this.convertToProposal(proposals[0]!) : null;
	}

	public async save(proposal: AccountLinkProposal): Promise<void> {
		await this.drizzleService.db.insert(this.drizzleService.schema.accountLinkProposalsTable).values({
			...proposal,
			secretHash: Buffer.from(proposal.secretHash),
		});
	}

	public async deleteById(proposalId: AccountLinkProposalId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkProposalsTable)
			.where(eq(this.drizzleService.schema.accountLinkProposalsTable.id, proposalId))
			.execute();
	}

	public async deleteExpiredProposals(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkProposalsTable)
			.where(lte(this.drizzleService.schema.accountLinkProposalsTable.expiresAt, new Date()))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.accountLinkProposalsTable)
			.where(eq(this.drizzleService.schema.accountLinkProposalsTable.userId, userId))
			.execute();
	}

	private convertToProposal(dto: FoundAccountLinkProposalDto): AccountLinkProposal {
		return {
			id: newAccountLinkProposalId(dto.id),
			userId: newUserId(dto.userId),
			code: dto.code,
			secretHash: new Uint8Array(dto.secretHash),
			email: dto.email,
			provider: newIdentityProviders(dto.provider),
			providerUserId: newIdentityProvidersUserId(dto.providerUserId),
			expiresAt: dto.expiresAt,
		};
	}
}
