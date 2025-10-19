import { err, ok } from "@mona-ca/core/utils";
import { isExpiredPasswordResetSession } from "../../../domain/entities/password-reset-session";
import { parseAnySessionToken } from "../../../domain/value-objects/session-token";

import type { ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { PasswordResetSessionToken } from "../../../domain/value-objects/session-token";
import type {
	IValidatePasswordResetSessionUseCase,
	ValidatePasswordResetSessionUseCaseResult,
} from "../../contracts/password/validate-password-reset-session.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IPasswordResetSessionRepository } from "../../ports/repositories/password-reset-session.repository.interface";

export class ValidatePasswordResetSessionUseCase implements IValidatePasswordResetSessionUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(
		passwordResetSessionToken: PasswordResetSessionToken,
	): Promise<ValidatePasswordResetSessionUseCaseResult> {
		const passwordResetSessionIdAndSecret = parseAnySessionToken(passwordResetSessionToken);

		if (!passwordResetSessionIdAndSecret) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		const { id: passwordResetSessionId, secret: passwordResetSessionSecret } = passwordResetSessionIdAndSecret;

		const passwordResetSession = await this.passwordResetSessionRepository.findById(passwordResetSessionId);

		if (!passwordResetSession) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		const userIdentity = await this.authUserRepository.findById(passwordResetSession.userId);

		if (!userIdentity) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (!this.sessionSecretHasher.verify(passwordResetSessionSecret, passwordResetSession.secretHash)) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_EXPIRED");
		}

		if (passwordResetSession.email !== userIdentity.email) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		return ok({ passwordResetSession, userIdentity });
	}
}
