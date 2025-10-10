import type { OAuthAccount } from "../../../domain/entities";
import type { OAuthProvider, OAuthProviderId, UserId } from "../../../domain/value-object";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account/interfaces/oauth-account.repository.interface";

export class OAuthAccountRepositoryMock implements IOAuthAccountRepository {
	private readonly oauthAccountMap: Map<string, OAuthAccount>;

	constructor(maps: {
		oauthAccountMap: Map<string, OAuthAccount>;
	}) {
		this.oauthAccountMap = maps.oauthAccountMap;
	}

	async findByUserId(userId: UserId): Promise<OAuthAccount[]> {
		return Array.from(this.oauthAccountMap.values()).filter(account => account.userId === userId);
	}

	async findByUserIdAndProvider(userId: UserId, provider: OAuthProvider): Promise<OAuthAccount | null> {
		return (
			Array.from(this.oauthAccountMap.values()).find(
				account => account.userId === userId && account.provider === provider,
			) || null
		);
	}

	async findByProviderAndProviderId(
		provider: OAuthProvider,
		providerId: OAuthProviderId,
	): Promise<OAuthAccount | null> {
		const key = `${provider}-${providerId}`;
		return this.oauthAccountMap.get(key) || null;
	}

	async save(oauthAccount: OAuthAccount): Promise<void> {
		const key = `${oauthAccount.provider}-${oauthAccount.providerId}`;
		this.oauthAccountMap.set(key, oauthAccount);
	}

	async deleteByUserIdAndProvider(userId: UserId, provider: OAuthProvider): Promise<void> {
		for (const [key, account] of this.oauthAccountMap.entries()) {
			if (account.userId === userId && account.provider === provider) {
				this.oauthAccountMap.delete(key);
			}
		}
	}

	async deleteByProviderAndProviderId(provider: OAuthProvider, providerId: OAuthProviderId): Promise<void> {
		const key = `${provider}-${providerId}`;
		this.oauthAccountMap.delete(key);
	}
}
