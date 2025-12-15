import { err, ok } from "@mona-ca/core/result";
import { isExpiredPasswordResetSession } from "../../../domain/entities/password-reset-session";
import { decodeToken } from "../../../domain/value-objects/tokens";

import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { PasswordResetSessionToken } from "../../../domain/value-objects/tokens";
import type {
	IPasswordResetValidateSessionUseCase,
	PasswordResetValidateSessionUseCaseResult,
} from "../../ports/in/password-reset/validate-session.usecase.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";
import type { IPasswordResetSessionRepository } from "../../ports/out/repositories/password-reset-session.repository.interface";

export class PasswordResetValidateSessionUseCase implements IPasswordResetValidateSessionUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		passwordResetSessionToken: PasswordResetSessionToken,
	): Promise<PasswordResetValidateSessionUseCaseResult> {
		const passwordResetSessionIdAndSecret = decodeToken(passwordResetSessionToken);

		if (!passwordResetSessionIdAndSecret) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		const { id: passwordResetSessionId, secret: passwordResetSessionSecret } = passwordResetSessionIdAndSecret;

		const passwordResetSession = await this.passwordResetSessionRepository.findById(passwordResetSessionId);

		if (!passwordResetSession) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (!this.tokenSecretService.verify(passwordResetSessionSecret, passwordResetSession.secretHash)) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_EXPIRED");
		}

		const userCredentials = await this.authUserRepository.findById(passwordResetSession.userId);

		if (!userCredentials) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (passwordResetSession.email !== userCredentials.email) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		return ok({ passwordResetSession, userCredentials });
	}
}
