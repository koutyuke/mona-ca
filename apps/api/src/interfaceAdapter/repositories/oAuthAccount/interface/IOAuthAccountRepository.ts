import type { OAuthAccount } from "@/domain/oAuthAccount";

export interface IOAuthAccountRepository {
	findByUserId(userId: OAuthAccount["userId"]): Promise<OAuthAccount | null>;
	findByProviderAndProviderId(
		provider: OAuthAccount["provider"],
		providerId: OAuthAccount["providerId"],
	): Promise<OAuthAccount | null>;
	create(oAuthAccount: Omit<OAuthAccount, "createdAt" | "updatedAt">): Promise<OAuthAccount>;
	updateByUserId(
		userId: OAuthAccount["userId"],
		oAuthAccount: Partial<Omit<OAuthAccount, "id" | "createdAt" | "updatedAt">>,
	): Promise<OAuthAccount>;
	deleteByUserId(userId: OAuthAccount["userId"], provider: OAuthAccount["provider"]): Promise<void>;
	deleteByProviderId(providerId: OAuthAccount["providerId"], provider: OAuthAccount["provider"]): Promise<void>;
}
