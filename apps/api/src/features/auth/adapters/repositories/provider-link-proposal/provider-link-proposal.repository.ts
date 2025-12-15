import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import { newProviderLinkProposalId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IProviderLinkProposalRepository } from "../../../application/ports/out/repositories/provider-link-proposal.repository.interface";
import type { ProviderLinkProposal } from "../../../domain/entities/provider-link-proposal";
import type { RawIdentityProviders } from "../../../domain/value-objects/identity-providers";
import type { ProviderLinkProposalId } from "../../../domain/value-objects/ids";

interface FoundProviderLinkProposalDto {
	id: string;
	userId: string;
	code: string | null;
	secretHash: Buffer;
	email: string;
	provider: RawIdentityProviders;
	providerUserId: string;
	expiresAt: Date;
}

export class ProviderLinkProposalRepository implements IProviderLinkProposalRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(proposalId: ProviderLinkProposalId): Promise<ProviderLinkProposal | null> {
		const proposals = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.providerLinkProposalsTable)
			.where(eq(this.drizzleService.schema.providerLinkProposalsTable.id, proposalId));

		if (proposals.length > 1) {
			throw new Error("Multiple proposals found for the same proposal id");
		}

		return proposals.length === 1 ? this.convertToProposal(proposals[0]!) : null;
	}

	public async save(proposal: ProviderLinkProposal): Promise<void> {
		await this.drizzleService.db.insert(this.drizzleService.schema.providerLinkProposalsTable).values({
			...proposal,
			secretHash: Buffer.from(proposal.secretHash),
		});
	}

	public async deleteById(proposalId: ProviderLinkProposalId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerLinkProposalsTable)
			.where(eq(this.drizzleService.schema.providerLinkProposalsTable.id, proposalId))
			.execute();
	}

	public async deleteExpiredProposals(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerLinkProposalsTable)
			.where(lte(this.drizzleService.schema.providerLinkProposalsTable.expiresAt, new Date()))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerLinkProposalsTable)
			.where(eq(this.drizzleService.schema.providerLinkProposalsTable.userId, userId))
			.execute();
	}

	private convertToProposal(dto: FoundProviderLinkProposalDto): ProviderLinkProposal {
		return {
			id: newProviderLinkProposalId(dto.id),
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
