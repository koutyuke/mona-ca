import type { IExternalIdentityRepository } from "../../../application/ports/out/repositories";
import type { ExternalIdentity } from "../../../domain/entities";
import type { ExternalIdentityProvider, ExternalIdentityProviderUserId, UserId } from "../../../domain/value-object";

export class ExternalIdentityRepositoryMock implements IExternalIdentityRepository {
	private readonly externalIdentityMap: Map<string, ExternalIdentity>;

	constructor(maps: {
		externalIdentityMap: Map<string, ExternalIdentity>;
	}) {
		this.externalIdentityMap = maps.externalIdentityMap;
	}

	async findByUserId(userId: UserId): Promise<ExternalIdentity[]> {
		return Array.from(this.externalIdentityMap.values()).filter(externalIdentity => externalIdentity.userId === userId);
	}

	async findByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<ExternalIdentity | null> {
		return (
			Array.from(this.externalIdentityMap.values()).find(
				externalIdentity => externalIdentity.userId === userId && externalIdentity.provider === provider,
			) || null
		);
	}

	async findByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): Promise<ExternalIdentity | null> {
		const key = `${provider}-${providerUserId}`;
		return this.externalIdentityMap.get(key) || null;
	}

	async save(externalIdentity: ExternalIdentity): Promise<void> {
		const key = `${externalIdentity.provider}-${externalIdentity.providerUserId}`;
		this.externalIdentityMap.set(key, externalIdentity);
	}

	async deleteByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<void> {
		for (const [key, externalIdentity] of this.externalIdentityMap.entries()) {
			if (externalIdentity.userId === userId && externalIdentity.provider === provider) {
				this.externalIdentityMap.delete(key);
			}
		}
	}

	async deleteByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): Promise<void> {
		const key = `${provider}-${providerUserId}`;
		this.externalIdentityMap.delete(key);
	}
}
