import { err, ok } from "@mona-ca/core/utils";

import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	IProviderConnectionDisconnectUseCase,
	ProviderConnectionDisconnectUseCaseResult,
} from "../../contracts/provider-connection/disconnect.usecase.interface";
import type { IProviderAccountRepository } from "../../ports/repositories/provider-account.repository.interface";

export class ProviderConnectionDisconnectUseCase implements IProviderConnectionDisconnectUseCase {
	constructor(private readonly providerAccountRepository: IProviderAccountRepository) {}

	public async execute(
		provider: IdentityProviders,
		userCredentials: UserCredentials,
	): Promise<ProviderConnectionDisconnectUseCaseResult> {
		const connectedProviderAccount = await this.providerAccountRepository.findByUserIdAndProvider(
			userCredentials.id,
			provider,
		);

		if (!connectedProviderAccount) {
			return err("PROVIDER_NOT_CONNECTED");
		}

		if (!userCredentials.passwordHash) {
			return err("PASSWORD_NOT_SET");
		}

		await this.providerAccountRepository.deleteByUserIdAndProvider(userCredentials.id, provider);
		return ok();
	}
}
