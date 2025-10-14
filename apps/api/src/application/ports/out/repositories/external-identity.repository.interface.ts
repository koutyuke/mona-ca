import type { ExternalIdentity } from "../../../../domain/entities";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
	UserId,
} from "../../../../domain/value-objects";

export interface IExternalIdentityRepository {
	findByUserId(userId: UserId): Promise<ExternalIdentity[]>;

	findByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<ExternalIdentity | null>;

	findByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): Promise<ExternalIdentity | null>;

	save(externalIdentity: ExternalIdentity): Promise<void>;

	deleteByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<void>;

	deleteByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): Promise<void>;
}
