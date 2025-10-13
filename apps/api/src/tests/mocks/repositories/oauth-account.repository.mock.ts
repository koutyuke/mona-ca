import type { IExternalIdentityRepository } from "../../../application/ports/out/repositories";
import type { ExternalIdentity } from "../../../domain/entities";
import type { ExternalIdentityProvider, ExternalIdentityProviderUserId, UserId } from "../../../domain/value-object";

export class OAuthAccountRepositoryMock implements IExternalIdentityRepository {
	private readonly oauthAccountMap: Map<string, ExternalIdentity>;

	constructor(maps: {
		oauthAccountMap: Map<string, ExternalIdentity>;
	}) {
		this.oauthAccountMap = maps.oauthAccountMap;
	}

	async findByUserId(userId: UserId): Promise<ExternalIdentity[]> {
		return Array.from(this.oauthAccountMap.values()).filter(account => account.userId === userId);
	}

	async findByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<ExternalIdentity | null> {
		return (
			Array.from(this.oauthAccountMap.values()).find(
				account => account.userId === userId && account.provider === provider,
			) || null
		);
	}

	async findByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerId: ExternalIdentityProviderUserId,
	): Promise<ExternalIdentity | null> {
		const key = `${provider}-${providerId}`;
		return this.oauthAccountMap.get(key) || null;
	}

	async save(oauthAccount: ExternalIdentity): Promise<void> {
		const key = `${oauthAccount.provider}-${oauthAccount.providerUserId}`;
		this.oauthAccountMap.set(key, oauthAccount);
	}

	async deleteByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<void> {
		for (const [key, account] of this.oauthAccountMap.entries()) {
			if (account.userId === userId && account.provider === provider) {
				this.oauthAccountMap.delete(key);
			}
		}
	}

	async deleteByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerId: ExternalIdentityProviderUserId,
	): Promise<void> {
		const key = `${provider}-${providerId}`;
		this.oauthAccountMap.delete(key);
	}
}
