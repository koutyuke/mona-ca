import { err } from "../../../common/utils";
import { type PasswordResetSession, isExpiredPasswordResetSession } from "../../../domain/entities";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IPasswordService } from "../../services/password";
import type { IResetPasswordUseCase, ResetPasswordUseCaseResult } from "./interfaces/reset-password.usecase.interface";

export class ResetPasswordUseCase implements IResetPasswordUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly passwordService: IPasswordService,
	) {}

	public async execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
	): Promise<ResetPasswordUseCaseResult> {
		if (!passwordResetSession.emailVerified) {
			return err("EMAIL_NOT_VERIFIED");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSession.id);
			return err("EXPIRED_TOKEN");
		}

		const user = await this.userRepository.findById(passwordResetSession.userId);
		if (user === null) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSession.id);
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
