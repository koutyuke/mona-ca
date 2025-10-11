import { err } from "../../../common/utils";
import { isExpiredPasswordResetSession } from "../../../domain/entities";
import { type PasswordResetSessionToken, parseSessionToken } from "../../../domain/value-object";
import { verifySessionSecret } from "../../../infrastructure/crypt";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IValidatePasswordResetSessionUseCase, ValidatePasswordResetSessionUseCaseResult } from "../../ports/in";

export class ValidatePasswordResetSessionUseCase implements IValidatePasswordResetSessionUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(
		passwordResetSessionToken: PasswordResetSessionToken,
	): Promise<ValidatePasswordResetSessionUseCaseResult> {
		const passwordResetSessionIdAndSecret = parseSessionToken(passwordResetSessionToken);

		if (!passwordResetSessionIdAndSecret) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		const { id: passwordResetSessionId, secret: passwordResetSessionSecret } = passwordResetSessionIdAndSecret;

		const passwordResetSession = await this.passwordResetSessionRepository.findById(passwordResetSessionId);

		if (!passwordResetSession) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		const user = await this.userRepository.findById(passwordResetSession.userId);

		if (!user) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (!verifySessionSecret(passwordResetSessionSecret, passwordResetSession.secretHash)) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_EXPIRED");
		}

		return { passwordResetSession, user };
	}
}
