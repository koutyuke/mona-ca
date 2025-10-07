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
			return err("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		const { id: accountAssociationSessionId, secret: accountAssociationSessionSecret } =
			accountAssociationSessionIdAndSecret;

		const accountAssociationSession =
			await this.accountAssociationSessionRepository.findById(accountAssociationSessionId);

		if (!accountAssociationSession) {
			return err("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		if (isExpiredAccountAssociationSession(accountAssociationSession)) {
			await this.accountAssociationSessionRepository.deleteById(accountAssociationSessionId);
			return err("ACCOUNT_ASSOCIATION_SESSION_EXPIRED");
		}

		if (
			!this.accountAssociationSessionSecretService.verifySessionSecret(
				accountAssociationSessionSecret,
				accountAssociationSession.secretHash,
			)
		) {
			return err("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		const user = await this.userRepository.findById(accountAssociationSession.userId);

		if (!user || user.email !== accountAssociationSession.email) {
			await this.accountAssociationSessionRepository.deleteById(accountAssociationSessionId);
			return err("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		return { accountAssociationSession, user };
	}
}
