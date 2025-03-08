import { and, eq } from "drizzle-orm";
import { OAuthAccount } from "../../../domain/entities";
import {
	type OAuthProvider,
	type OAuthProviderId,
	type UserId,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../../domain/value-object";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { IOAuthAccountRepository } from "./interfaces/oauth-account.repository.interface";

interface FoundOAuthAccountDto {
	provider: "discord";
	providerId: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
}

export class OAuthAccountRepository implements IOAuthAccountRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findByUserIdAndProvider(userId: UserId, provider: OAuthProvider): Promise<OAuthAccount | null> {
		const oauthAccounts = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.oauthAccounts)
			.where(
				and(
					eq(this.drizzleService.schema.oauthAccounts.userId, userId),
					eq(this.drizzleService.schema.oauthAccounts.provider, provider),
				),
			);

		if (oauthAccounts.length > 1) {
			throw new Error("Multiple OAuth accounts found for the same user and provider");
		}

		return oauthAccounts.length === 1 ? this.convertToOAuthAccount(oauthAccounts[0]!) : null;
	}

	public async findByProviderAndProviderId(
		provider: OAuthProvider,
		providerId: OAuthProviderId,
	): Promise<OAuthAccount | null> {
		const oauthAccounts = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.oauthAccounts)
			.where(
				and(
					eq(this.drizzleService.schema.oauthAccounts.providerId, providerId),
					eq(this.drizzleService.schema.oauthAccounts.provider, provider),
				),
			);

		if (oauthAccounts.length > 1) {
			throw new Error("Multiple OAuth accounts found for the same provider and providerId");
		}

		return oauthAccounts.length === 1 ? this.convertToOAuthAccount(oauthAccounts[0]!) : null;
	}

	public async save(oauthAccount: OAuthAccount): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.oauthAccounts)
			.values(oauthAccount)
			.onConflictDoUpdate({
				target: [this.drizzleService.schema.oauthAccounts.userId, this.drizzleService.schema.oauthAccounts.provider],
				set: {
					providerId: oauthAccount.providerId,
					updatedAt: oauthAccount.updatedAt,
				},
			});
	}

	public async deleteByUserIdAndProvider(userId: UserId, provider: OAuthProvider): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.oauthAccounts)
			.where(
				and(
					eq(this.drizzleService.schema.oauthAccounts.userId, userId),
					eq(this.drizzleService.schema.oauthAccounts.provider, provider),
				),
			);
	}

	public async deleteByProviderAndProviderId(provider: OAuthProvider, providerId: OAuthProviderId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.oauthAccounts)
			.where(
				and(
					eq(this.drizzleService.schema.oauthAccounts.providerId, providerId),
					eq(this.drizzleService.schema.oauthAccounts.provider, provider),
				),
			);
	}

	private convertToOAuthAccount(dto: FoundOAuthAccountDto): OAuthAccount {
		return new OAuthAccount({
			provider: newOAuthProvider(dto.provider),
			providerId: newOAuthProviderId(dto.providerId),
			userId: newUserId(dto.userId),
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
		});
	}
}
