import { err, ok } from "@mona-ca/core/utils";

import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";
import type {
	IUnlinkAccountConnectionUseCase,
	UnlinkAccountConnectionUseCaseResult,
} from "../../contracts/account-link/unlink-account-connection.usecase.interface";
import type { IExternalIdentityRepository } from "../../ports/repositories/external-identity.repository.interface";

export class UnlinkAccountConnectionUseCase implements IUnlinkAccountConnectionUseCase {
	constructor(private readonly externalIdentityRepository: IExternalIdentityRepository) {}

	public async execute(
		provider: ExternalIdentityProvider,
		userIdentity: UserIdentity,
	): Promise<UnlinkAccountConnectionUseCaseResult> {
		const linkedAccount = await this.externalIdentityRepository.findByUserIdAndProvider(userIdentity.id, provider);

		if (!linkedAccount) {
			return err("PROVIDER_NOT_LINKED");
		}

		if (!userIdentity.passwordHash) {
			return err("PASSWORD_NOT_SET");
		}

		await this.externalIdentityRepository.deleteByUserIdAndProvider(userIdentity.id, provider);
		return ok();
	}
}
