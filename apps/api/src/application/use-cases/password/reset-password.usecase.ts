import { err } from "../../../common/utils";
import type { PasswordResetSession, User } from "../../../domain/entities";
import { hashPassword } from "../../../infrastructure/crypt";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IResetPasswordUseCase, ResetPasswordUseCaseResult } from "../../ports/in";

// this use case will be called after the validate password reset session use case.
// so we don't need to check the expired password reset session.
export class ResetPasswordUseCase implements IResetPasswordUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
	) {}

	public async execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
		user: User,
	): Promise<ResetPasswordUseCaseResult> {
		if (!passwordResetSession.emailVerified) {
			return err("REQUIRED_EMAIL_VERIFICATION");
		}

		const passwordHash = await hashPassword(newPassword);

		await Promise.all([
			this.userRepository.save(user, { passwordHash }),
			this.passwordResetSessionRepository.deleteByUserId(user.id),

			// Delete all sessions of the user to force them to login again.
			this.sessionRepository.deleteByUserId(user.id),
		]);

		return;
	}
}
