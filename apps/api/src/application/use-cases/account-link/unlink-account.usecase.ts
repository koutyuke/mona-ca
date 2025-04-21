import { err } from "../../../common/utils";
import type { OAuthProvider, UserId } from "../../../domain/value-object";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { IUnlinkAccountUseCase, UnlinkAccountUseCaseResult } from "./interfaces/unlink-account.usecase.interface";

export class UnlinkAccountUseCase implements IUnlinkAccountUseCase {
	constructor(private readonly oauthAccountRepository: IOAuthAccountRepository) {}

	public async execute(userId: UserId, provider: OAuthProvider): Promise<UnlinkAccountUseCaseResult> {
		const linkedAccount = await this.oauthAccountRepository.findByUserIdAndProvider(userId, provider);

		if (!linkedAccount) {
			return err("ACCOUNT_NOT_LINKED");
		}

		try {
			await this.oauthAccountRepository.deleteByUserIdAndProvider(userId, provider);

			return {
				message: "Account successfully unlinked",
			};
		} catch (error) {
			console.error(`Failed to unlink account: ${error}`);
			return err("FAILED_TO_UNLINK_ACCOUNT");
		}
	}
}
