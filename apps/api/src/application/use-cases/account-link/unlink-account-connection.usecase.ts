import { err } from "../../../common/utils";
import type { OAuthProvider, UserId } from "../../../domain/value-object";
import type { IUnlinkAccountConnectionUseCase, UnlinkAccountConnectionUseCaseResult } from "../../ports/in";
import type { IOAuthAccountRepository, IUserRepository } from "../../ports/out/repositories";

export class UnlinkAccountConnectionUseCase implements IUnlinkAccountConnectionUseCase {
	constructor(
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(provider: OAuthProvider, userId: UserId): Promise<UnlinkAccountConnectionUseCaseResult> {
		const linkedAccount = await this.oauthAccountRepository.findByUserIdAndProvider(userId, provider);
		const passwordHashed = await this.userRepository.findPasswordHashById(userId);

		if (!linkedAccount) {
			return err("ACCOUNT_NOT_LINKED");
		}

		if (!passwordHashed) {
			return err("PASSWORD_NOT_SET");
		}

		try {
			await this.oauthAccountRepository.deleteByUserIdAndProvider(userId, provider);
			return;
		} catch (error) {
			console.error(`Failed to unlink account: ${error}`);
			return err("UNLINK_OPERATION_FAILED");
		}
	}
}
