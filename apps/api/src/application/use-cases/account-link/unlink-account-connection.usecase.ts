import { err } from "../../../common/utils";
import type { OAuthProvider, UserId } from "../../../domain/value-object";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type {
	IUnlinkAccountConnectionUseCase,
	UnlinkAccountConnectionUseCaseResult,
} from "./interfaces/unlink-account-connection.usecase.interface";

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
			return err("PASSWORD_DOES_NOT_SET");
		}

		try {
			await this.oauthAccountRepository.deleteByUserIdAndProvider(userId, provider);
			return;
		} catch (error) {
			console.error(`Failed to unlink account: ${error}`);
			return err("FAILED_TO_UNLINK_ACCOUNT");
		}
	}
}
