import type { OAuthAccount } from "../../../../domain/entities";

export interface IOAuthAccountRepository {
	findByUserId(userId: OAuthAccount["userId"]): Promise<OAuthAccount | null>;
	findByProviderAndProviderId(
		provider: OAuthAccount["provider"],
		providerId: OAuthAccount["providerId"],
	): Promise<OAuthAccount | null>;
	create(
		oAuthAccount: Omit<ConstructorParameters<typeof OAuthAccount>[0], "createdAt" | "updatedAt">,
	): Promise<OAuthAccount>;
	updateByUserId(
		userId: OAuthAccount["userId"],
		oAuthAccount: Partial<Omit<ConstructorParameters<typeof OAuthAccount>[0], "id" | "createdAt" | "updatedAt">>,
	): Promise<OAuthAccount>;
	deleteByUserId(userId: OAuthAccount["userId"], provider: OAuthAccount["provider"]): Promise<void>;
	deleteByProviderAndProviderId(
		provider: OAuthAccount["provider"],
		providerId: OAuthAccount["providerId"],
	): Promise<void>;
}
