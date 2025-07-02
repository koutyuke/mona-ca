import { err } from "../../../common/utils";
import { isExpiredAccountAssociationSession } from "../../../domain/entities";
import type { AccountAssociationSessionId } from "../../../domain/value-object";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, separateSessionTokenToIdAndSecret } from "../../services/session";
import type {
	IValidateAccountAssociationSessionUseCase,
	ValidateAccountAssociationSessionUseCaseResult,
} from "./interfaces/validate-account-association-session.interface.usecase";

export class ValidateAccountAssociationSessionUseCase implements IValidateAccountAssociationSessionUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly accountAssociationSessionSecretService: ISessionSecretService,
	) {}

	public async execute(
		accountAssociationSessionToken: string,
	): Promise<ValidateAccountAssociationSessionUseCaseResult> {
		const accountAssociationSessionIdAndSecret =
			separateSessionTokenToIdAndSecret<AccountAssociationSessionId>(accountAssociationSessionToken);

		if (!accountAssociationSessionIdAndSecret) {
			return err("INVALID_TOKEN");
		}

		const { id: accountAssociationSessionId, secret: accountAssociationSessionSecret } =
			accountAssociationSessionIdAndSecret;

		const accountAssociationSession =
			await this.accountAssociationSessionRepository.findById(accountAssociationSessionId);

		if (!accountAssociationSession) {
			return err("INVALID_TOKEN");
		}

		if (isExpiredAccountAssociationSession(accountAssociationSession)) {
			return err("EXPIRED_CODE");
		}

		if (
			!this.accountAssociationSessionSecretService.verifySessionSecret(
				accountAssociationSessionSecret,
				accountAssociationSession.secretHash,
			)
		) {
			return err("INVALID_TOKEN");
		}

		const user = await this.userRepository.findById(accountAssociationSession.userId);

		if (!user) {
			return err("USER_NOT_FOUND");
		}

		if (user.email !== accountAssociationSession.email) {
			return err("INVALID_EMAIL");
		}

		if (!user.emailVerified) {
			return err("EMAIL_NOT_VERIFIED");
		}

		return { accountAssociationSession, user };
	}
}
