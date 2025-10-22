import type { UserId } from "../../../../../core/domain/value-objects";
import type { ExternalIdentity } from "../../../domain/entities/external-identity";
import type {
	ExternalIdentityProvider,
	ExternalIdentityProviderUserId,
} from "../../../domain/value-objects/external-identity";

export interface IExternalIdentityRepository {
	findByUserId(userId: UserId): Promise<ExternalIdentity[]>;

	findByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<ExternalIdentity | null>;

	findByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): Promise<ExternalIdentity | null>;

	save(externalIdentity: ExternalIdentity): Promise<void>;

	deleteByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<void>;
}
