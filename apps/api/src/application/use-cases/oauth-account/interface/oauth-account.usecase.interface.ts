import type { OAuthAccount } from "@/domain/oauth-account";
import type { User } from "@/domain/user";

export interface IOAuthAccountUseCase {
	getOAuthAccountByUserId(userId: User["id"]): Promise<OAuthAccount | null>;
	getOAuthAccountByProviderAndProviderId(
		provider: OAuthAccount["provider"],
		providerId: OAuthAccount["providerId"],
	): Promise<OAuthAccount | null>;
	createOAuthAccount(
		oAuthAccount: Omit<ConstructorParameters<typeof OAuthAccount>[0], "createdAt" | "updatedAt">,
	): Promise<OAuthAccount>;
	updateOAuthAccountByUserId(
		userId: User["id"],
		oAuthAccount: Partial<Omit<ConstructorParameters<typeof OAuthAccount>[0], "id" | "createdAt" | "updatedAt">>,
	): Promise<OAuthAccount>;
	deleteOAuthAccountByUserId(userId: User["id"], provider: OAuthAccount["provider"]): Promise<void>;
	deleteOAuthAccountByProviderId(
		providerId: OAuthAccount["providerId"],
		provider: OAuthAccount["provider"],
	): Promise<void>;
}
