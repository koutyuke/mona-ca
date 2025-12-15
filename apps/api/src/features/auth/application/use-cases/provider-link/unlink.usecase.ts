import { err, ok } from "@mona-ca/core/result";

import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	IProviderLinkUnlinkUseCase,
	ProviderLinkUnlinkUseCaseResult,
} from "../../ports/in/provider-link/unlink.usecase.interface";
import type { IProviderAccountRepository } from "../../ports/out/repositories/provider-account.repository.interface";

export class ProviderLinkUnlinkUseCase implements IProviderLinkUnlinkUseCase {
	constructor(private readonly providerAccountRepository: IProviderAccountRepository) {}

	public async execute(
		provider: IdentityProviders,
		userCredentials: UserCredentials,
	): Promise<ProviderLinkUnlinkUseCaseResult> {
		const connectedProviderAccount = await this.providerAccountRepository.findByUserIdAndProvider(
			userCredentials.id,
			provider,
		);

		if (!connectedProviderAccount) {
			return err("PROVIDER_NOT_LINKED");
		}

		if (!userCredentials.passwordHash) {
			return err("PASSWORD_NOT_SET");
		}

		await this.providerAccountRepository.deleteByUserIdAndProvider(userCredentials.id, provider);
		return ok();
	}
}
