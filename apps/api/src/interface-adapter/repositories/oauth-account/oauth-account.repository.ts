import { and, eq } from "drizzle-orm";
import { OAuthAccount } from "../../../domain/entities/oauth-account";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { IOAuthAccountRepository } from "./interfaces/oauth-account.repository.interface";

export class OAuthAccountRepository implements IOAuthAccountRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findByUserId(userId: OAuthAccount["userId"]): Promise<OAuthAccount | null> {
		const oAuthAccount = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.oAuthAccounts)
			.where(eq(this.drizzleService.schema.oAuthAccounts.userId, userId));

		return oAuthAccount.length === 1 ? new OAuthAccount(oAuthAccount[0]!) : null;
	}

	public async findByProviderAndProviderId(
		provider: OAuthAccount["provider"],
		providerId: OAuthAccount["providerId"],
	): Promise<OAuthAccount | null> {
		const oAuthAccount = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.oAuthAccounts)
			.where(
				and(
					eq(this.drizzleService.schema.oAuthAccounts.providerId, providerId),
					eq(this.drizzleService.schema.oAuthAccounts.provider, provider),
				),
			);
		return oAuthAccount.length === 1 ? new OAuthAccount(oAuthAccount[0]!) : null;
	}

	public async create(
		oAuthAccount: Omit<ConstructorParameters<typeof OAuthAccount>[0], "createdAt" | "updatedAt">,
	): Promise<OAuthAccount> {
		const createdOAuthAccount = await this.drizzleService.db
			.insert(this.drizzleService.schema.oAuthAccounts)
			.values(oAuthAccount)
			.returning();

		if (createdOAuthAccount.length !== 1) {
			throw new Error("Failed to create OAuthAccount");
		}

		return new OAuthAccount(createdOAuthAccount[0]!);
	}

	public async updateByUserId(
		userId: OAuthAccount["userId"],
		oAuthAccount: Partial<Omit<ConstructorParameters<typeof OAuthAccount>[0], "id" | "createdAt" | "updatedAt">>,
	): Promise<OAuthAccount> {
		const updatedOAuthAccount = await this.drizzleService.db
			.update(this.drizzleService.schema.oAuthAccounts)
			.set(oAuthAccount)
			.where(eq(this.drizzleService.schema.oAuthAccounts.userId, userId))
			.returning();

		if (updatedOAuthAccount.length !== 1) {
			throw new Error("Failed to update OAuthAccount");
		}

		return new OAuthAccount(updatedOAuthAccount[0]!);
	}

	public async deleteByUserId(userId: OAuthAccount["userId"], provider: OAuthAccount["provider"]): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.oAuthAccounts)
			.where(
				and(
					eq(this.drizzleService.schema.oAuthAccounts.userId, userId),
					eq(this.drizzleService.schema.oAuthAccounts.provider, provider),
				),
			);
	}

	public async deleteByProviderId(
		providerId: OAuthAccount["providerId"],
		provider: OAuthAccount["provider"],
	): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.oAuthAccounts)
			.where(
				and(
					eq(this.drizzleService.schema.oAuthAccounts.providerId, providerId),
					eq(this.drizzleService.schema.oAuthAccounts.provider, provider),
				),
			);
	}
}
