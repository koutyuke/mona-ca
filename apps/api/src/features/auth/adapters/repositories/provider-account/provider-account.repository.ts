import { and, eq } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IProviderAccountRepository } from "../../../application/ports/out/repositories/provider-account.repository.interface";
import type { ProviderAccount } from "../../../domain/entities/provider-account";
import type {
	IdentityProviders,
	IdentityProvidersUserId,
	RawIdentityProviders,
} from "../../../domain/value-objects/identity-providers";

interface FoundProviderAccountDto {
	provider: RawIdentityProviders;
	providerUserId: string;
	userId: string;
	linkedAt: Date;
}

export class ProviderAccountRepository implements IProviderAccountRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findByUserId(userId: UserId): Promise<ProviderAccount[]> {
		const providerAccounts = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.providerAccountsTable)
			.where(eq(this.drizzleService.schema.providerAccountsTable.userId, userId));

		return providerAccounts.map(this.convertToProviderAccount);
	}

	public async findByUserIdAndProvider(userId: UserId, provider: IdentityProviders): Promise<ProviderAccount | null> {
		const providerAccounts = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.providerAccountsTable)
			.where(
				and(
					eq(this.drizzleService.schema.providerAccountsTable.userId, userId),
					eq(this.drizzleService.schema.providerAccountsTable.provider, provider),
				),
			);

		if (providerAccounts.length > 1) {
			throw new Error("Multiple provider accounts found for the same user and provider");
		}

		return providerAccounts.length === 1 ? this.convertToProviderAccount(providerAccounts[0]!) : null;
	}

	public async findByProviderAndProviderUserId(
		provider: IdentityProviders,
		providerUserId: IdentityProvidersUserId,
	): Promise<ProviderAccount | null> {
		const providerAccounts = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.providerAccountsTable)
			.where(
				and(
					eq(this.drizzleService.schema.providerAccountsTable.providerUserId, providerUserId),
					eq(this.drizzleService.schema.providerAccountsTable.provider, provider),
				),
			);

		if (providerAccounts.length > 1) {
			throw new Error("Multiple provider accounts found for the same provider and providerUserId");
		}

		return providerAccounts.length === 1 ? this.convertToProviderAccount(providerAccounts[0]!) : null;
	}

	public async save(providerAccount: ProviderAccount): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.providerAccountsTable)
			.values(providerAccount)
			.onConflictDoNothing({
				target: [
					this.drizzleService.schema.providerAccountsTable.provider,
					this.drizzleService.schema.providerAccountsTable.providerUserId,
				],
			});
	}

	public async deleteByUserIdAndProvider(userId: UserId, provider: IdentityProviders): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.providerAccountsTable)
			.where(
				and(
					eq(this.drizzleService.schema.providerAccountsTable.userId, userId),
					eq(this.drizzleService.schema.providerAccountsTable.provider, provider),
				),
			);
	}

	private convertToProviderAccount(dto: FoundProviderAccountDto): ProviderAccount {
		return {
			provider: newIdentityProviders(dto.provider),
			providerUserId: newIdentityProvidersUserId(dto.providerUserId),
			userId: newUserId(dto.userId),
			linkedAt: dto.linkedAt,
		} satisfies ProviderAccount;
	}
}
