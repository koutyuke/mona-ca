import type { UserId } from "../../../../../core/domain/value-objects";
import type { IProviderAccountRepository } from "../../../application/ports/out/repositories/provider-account.repository.interface";
import type { ProviderAccount } from "../../../domain/entities/provider-account";
import type { IdentityProviders, IdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

export class ProviderAccountRepositoryMock implements IProviderAccountRepository {
	private readonly providerAccountMap: Map<string, ProviderAccount>;

	constructor(maps: {
		providerAccountMap: Map<string, ProviderAccount>;
	}) {
		this.providerAccountMap = maps.providerAccountMap;
	}

	async findByUserId(userId: UserId): Promise<ProviderAccount[]> {
		return Array.from(this.providerAccountMap.values()).filter(providerAccount => providerAccount.userId === userId);
	}

	async findByUserIdAndProvider(userId: UserId, provider: IdentityProviders): Promise<ProviderAccount | null> {
		return (
			Array.from(this.providerAccountMap.values()).find(
				providerAccount => providerAccount.userId === userId && providerAccount.provider === provider,
			) || null
		);
	}

	async findByProviderAndProviderUserId(
		provider: IdentityProviders,
		providerUserId: IdentityProvidersUserId,
	): Promise<ProviderAccount | null> {
		const key = `${provider}-${providerUserId}`;
		return this.providerAccountMap.get(key) || null;
	}

	async save(providerAccount: ProviderAccount): Promise<void> {
		const key = `${providerAccount.provider}-${providerAccount.providerUserId}`;
		this.providerAccountMap.set(key, providerAccount);
	}

	async deleteByUserIdAndProvider(userId: UserId, provider: IdentityProviders): Promise<void> {
		for (const [key, providerAccount] of this.providerAccountMap.entries()) {
			if (providerAccount.userId === userId && providerAccount.provider === provider) {
				this.providerAccountMap.delete(key);
			}
		}
	}
}
