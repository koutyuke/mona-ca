import { err, ok } from "@mona-ca/core/utils";
import { isExpiredAccountAssociationSession } from "../../../domain/entities";
import { type AccountAssociationSessionToken, parseSessionToken } from "../../../domain/value-objects";
import type {
	IValidateAccountAssociationSessionUseCase,
	ValidateAccountAssociationSessionUseCaseResult,
} from "../../ports/in";
import type { IAccountAssociationSessionRepository, IUserRepository } from "../../ports/out/repositories";
import type { ISessionSecretHasher } from "../../ports/out/system";

export class ValidateAccountAssociationSessionUseCase implements IValidateAccountAssociationSessionUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
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

		if (!this.sessionSecretHasher.verify(accountAssociationSessionSecret, accountAssociationSession.secretHash)) {
			return err("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		const user = await this.userRepository.findById(accountAssociationSession.userId);

		if (!user || user.email !== accountAssociationSession.email) {
			await this.accountAssociationSessionRepository.deleteById(accountAssociationSessionId);
			return err("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		return ok({ accountAssociationSession, user });
	}
}
