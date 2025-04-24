import { err, isErr } from "../../../common/utils";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { AppEnv } from "../../../modules/env";
import type {
	AccountAssociationPreviewUseCaseResult,
	IAccountAssociationPreviewUseCase,
} from "./interfaces/account-association-preview.interface.usecase";
import { validateAccountAssociationState } from "./utils";

export class AccountAssociationPreviewUseCase implements IAccountAssociationPreviewUseCase {
	constructor(
		private readonly env: {
			ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET: AppEnv["ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET"];
		},
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(state: string): Promise<AccountAssociationPreviewUseCaseResult> {
		const result = validateAccountAssociationState(state, this.env.ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET);

		if (isErr(result)) {
			switch (result.code) {
				case "INVALID_SIGNED_STATE":
				case "FAILED_TO_DECODE_SIGNED_STATE":
					return err("INVALID_STATE");
				case "EXPIRED_STATE":
					return err("EXPIRED_STATE");
			}
		}

		const { userId, provider, providerId } = result;

		const user = await this.userRepository.findById(userId);

		if (!user) {
			return err("USER_NOT_FOUND");
		}

		return { user, provider, providerId };
	}
}
