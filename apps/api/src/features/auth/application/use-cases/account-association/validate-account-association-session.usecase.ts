import { err, ok } from "@mona-ca/core/utils";
import { isExpiredAccountAssociationSession } from "../../../domain/entities/account-association-session";
import { parseAnySessionToken } from "../../../domain/value-objects/session-token";

import type { ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { AccountAssociationSessionToken } from "../../../domain/value-objects/session-token";
import type {
	IValidateAccountAssociationSessionUseCase,
	ValidateAccountAssociationSessionUseCaseResult,
} from "../../contracts/account-association/validate-account-association-session.usecase.interface";
import type { IAccountAssociationSessionRepository } from "../../ports/repositories/account-association-session.repository.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";

export class ValidateAccountAssociationSessionUseCase implements IValidateAccountAssociationSessionUseCase {
	constructor(
		private readonly authUserRepository: IAuthUserRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(
		accountAssociationSessionToken: AccountAssociationSessionToken,
	): Promise<ValidateAccountAssociationSessionUseCaseResult> {
		const accountAssociationSessionIdAndSecret = parseAnySessionToken(accountAssociationSessionToken);

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

		const userIdentity = await this.authUserRepository.findById(accountAssociationSession.userId);

		if (!userIdentity || userIdentity.email !== accountAssociationSession.email) {
			await this.accountAssociationSessionRepository.deleteById(accountAssociationSessionId);
			return err("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		return ok({ accountAssociationSession, userIdentity });
	}
}
