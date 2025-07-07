import { and, eq } from "drizzle-orm";
import type { ToPrimitive } from "../../../common/utils";
import type { OAuthAccount } from "../../../domain/entities";
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
	provider: ToPrimitive<OAuthProvider>;
	providerId: string;
	userId: string;
	linkedAt: Date;
}

export class OAuthAccountRepository implements IOAuthAccountRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findByUserId(userId: UserId): Promise<OAuthAccount[]> {
		const oauthAccounts = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.oauthAccounts)
			.where(eq(this.drizzleService.schema.oauthAccounts.userId, userId));

		return oauthAccounts.map(this.convertToOAuthAccount);
	}

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
			.onConflictDoNothing({
				target: [
					this.drizzleService.schema.oauthAccounts.provider,
					this.drizzleService.schema.oauthAccounts.providerId,
				],
			})
			.onConflictDoNothing();
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
		return {
			provider: newOAuthProvider(dto.provider),
			providerId: newOAuthProviderId(dto.providerId),
			userId: newUserId(dto.userId),
			linkedAt: dto.linkedAt,
		} satisfies OAuthAccount;
	}
}
