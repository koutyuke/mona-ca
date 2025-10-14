import { err, ok } from "@mona-ca/core/utils";
import type { ExternalIdentityProvider, UserId } from "../../../domain/value-object";
import type { IUnlinkAccountConnectionUseCase, UnlinkAccountConnectionUseCaseResult } from "../../ports/in";
import type { IExternalIdentityRepository, IUserRepository } from "../../ports/out/repositories";

export class UnlinkAccountConnectionUseCase implements IUnlinkAccountConnectionUseCase {
	constructor(
		private readonly externalIdentityRepository: IExternalIdentityRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(
		provider: ExternalIdentityProvider,
		userId: UserId,
	): Promise<UnlinkAccountConnectionUseCaseResult> {
		const linkedAccount = await this.externalIdentityRepository.findByUserIdAndProvider(userId, provider);
		const passwordHashed = await this.userRepository.findPasswordHashById(userId);

		if (!linkedAccount) {
			return err("PROVIDER_NOT_LINKED");
		}

		if (!passwordHashed) {
			return err("PASSWORD_NOT_SET");
		}

		try {
			await this.externalIdentityRepository.deleteByUserIdAndProvider(userId, provider);
			return ok();
		} catch (error) {
			console.error(`Failed to unlink account: ${error}`);
			return err("UNLINK_OPERATION_FAILED");
		}
	}
}
