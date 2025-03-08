import type { OAuthAccount } from "../../../../domain/entities";
import type { OAuthProvider, OAuthProviderId, UserId } from "../../../../domain/value-object";

export interface IOAuthAccountRepository {
	findByUserIdAndProvider(userId: UserId, provider: OAuthProvider): Promise<OAuthAccount | null>;

	findByProviderAndProviderId(provider: OAuthProvider, providerId: OAuthProviderId): Promise<OAuthAccount | null>;

	save(oauthAccount: OAuthAccount): Promise<void>;

	deleteByUserIdAndProvider(userId: UserId, provider: OAuthProvider): Promise<void>;

	deleteByProviderAndProviderId(provider: OAuthProvider, providerId: OAuthProviderId): Promise<void>;
}
