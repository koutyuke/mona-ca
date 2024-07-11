import type { OAuthAccount } from "@/domain/oAuthAccount";
import type { User } from "@/domain/user";
import type { IOAuthAccountRepository } from "@/interfaceAdapter/repositories/oAuthAccount";
import type { IOAuthAccountUseCase } from "./interface/IOAuthAccountUseCase";

export class OAuthAccountUseCase implements IOAuthAccountUseCase {
	constructor(private readonly oAuthAccountRepository: IOAuthAccountRepository) {}

	public async getOAuthAccountByUserId(userId: string): Promise<OAuthAccount | null> {
		return await this.oAuthAccountRepository.findByUserId(userId);
	}

	public async getOAuthAccountByProviderAndProviderId(
		provider: OAuthAccount["provider"],
		providerId: OAuthAccount["providerId"],
	): Promise<OAuthAccount | null> {
		return await this.oAuthAccountRepository.findByProviderAndProviderId(provider, providerId);
	}

	public async createOAuthAccount(oAuthAccount: Omit<OAuthAccount, "createdAt" | "updatedAt">): Promise<OAuthAccount> {
		return await this.oAuthAccountRepository.create(oAuthAccount);
	}

	public async updateOAuthAccountByUserId(
		userId: string,
		oAuthAccount: Partial<Omit<OAuthAccount, "id" | "createdAt" | "updatedAt">>,
	): Promise<OAuthAccount> {
		return await this.oAuthAccountRepository.updateByUserId(userId, oAuthAccount);
	}

	public async deleteOAuthAccountByUserId(userId: User["id"], provider: OAuthAccount["provider"]): Promise<void> {
		return await this.oAuthAccountRepository.deleteByUserId(userId, provider);
	}

	public async deleteOAuthAccountByProviderId(
		providerId: OAuthAccount["providerId"],
		provider: OAuthAccount["provider"],
	): Promise<void> {
		return await this.oAuthAccountRepository.deleteByProviderId(providerId, provider);
	}
}
