import { err } from "../../../common/utils";
import { isExpiredPasswordResetSession } from "../../../domain/entities";
import { newPasswordResetSessionId } from "../../../domain/value-object";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IPasswordService } from "../../services/password";
import type { ISessionTokenService } from "../../services/session-token";
import type { IResetPasswordUseCase, ResetPasswordUseCaseResult } from "./interfaces/reset-password.usecase.interface";

export class ResetPasswordUseCase implements IResetPasswordUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordService: IPasswordService,
		private readonly passwordResetSessionTokenService: ISessionTokenService,
	) {}

	public async execute(passwordResetSessionToken: string, newPassword: string): Promise<ResetPasswordUseCaseResult> {
		const passwordResetSessionId = newPasswordResetSessionId(
			this.passwordResetSessionTokenService.hashSessionToken(passwordResetSessionToken),
		);
		const passwordResetSession = await this.passwordResetSessionRepository.findById(passwordResetSessionId);

		if (passwordResetSession === null) {
			return err("INVALID_TOKEN");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			return err("TOKEN_EXPIRED");
		}

		if (!passwordResetSession.emailVerified) {
			return err("EMAIL_NOT_VERIFIED");
		}

		const user = await this.userRepository.findById(passwordResetSession.userId);
		if (user === null) {
			return err("INVALID_TOKEN");
		}

		const passwordHash = await this.passwordService.hashPassword(newPassword);

		await Promise.all([
			this.userRepository.save(user, { passwordHash }),
			this.passwordResetSessionRepository.deleteByUserId(user.id),

			// Delete all sessions of the user to force them to login again.
			this.sessionRepository.deleteByUserId(user.id),
		]);

		return;
	}
}
