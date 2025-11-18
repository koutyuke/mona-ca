import type { UserId } from "../../../../../core/domain/value-objects";
import type { ProviderAccount } from "../../../domain/entities/provider-account";
import type { IdentityProviders, IdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

export interface IProviderAccountRepository {
	findByUserId(userId: UserId): Promise<ProviderAccount[]>;

	findByUserIdAndProvider(userId: UserId, provider: IdentityProviders): Promise<ProviderAccount | null>;

	findByProviderAndProviderUserId(
		provider: IdentityProviders,
		providerUserId: IdentityProvidersUserId,
	): Promise<ProviderAccount | null>;

	save(providerAccount: ProviderAccount): Promise<void>;

	deleteByUserIdAndProvider(userId: UserId, provider: IdentityProviders): Promise<void>;
}
