import { err } from "../../../common/utils";
import { isExpiredAccountAssociationSession } from "../../../domain/entities";
import { type AccountAssociationSessionToken, parseSessionToken } from "../../../domain/value-object";
import { verifySessionSecret } from "../../../infrastructure/crypt";
import type {
	IValidateAccountAssociationSessionUseCase,
	ValidateAccountAssociationSessionUseCaseResult,
} from "../../ports/in";
import type { IAccountAssociationSessionRepository, IUserRepository } from "../../ports/out/repositories";

export class ValidateAccountAssociationSessionUseCase implements IValidateAccountAssociationSessionUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
	) {}

	public async execute(
		accountAssociationSessionToken: AccountAssociationSessionToken,
	): Promise<ValidateAccountAssociationSessionUseCaseResult> {
		const accountAssociationSessionIdAndSecret = parseSessionToken(accountAssociationSessionToken);

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

		if (!verifySessionSecret(accountAssociationSessionSecret, accountAssociationSession.secretHash)) {
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
