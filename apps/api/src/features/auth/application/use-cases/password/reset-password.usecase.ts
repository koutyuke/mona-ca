import { err, ok } from "@mona-ca/core/utils";
import type { IResetPasswordUseCase, ResetPasswordUseCaseResult } from "../../../../../application/ports/in";
import type { IPasswordHasher } from "../../../../../common/ports/system";
import type { PasswordResetSession, User } from "../../../domain/entities";
import type {
	IPasswordResetSessionRepository,
	ISessionRepository,
	IUserRepository,
} from "../../ports/out/repositories";

// this use case will be called after the validate password reset session use case.
// so we don't need to check the expired password reset session.
export class ResetPasswordUseCase implements IResetPasswordUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly passwordHasher: IPasswordHasher,
	) {}

	public async execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
		user: User,
	): Promise<ResetPasswordUseCaseResult> {
		if (!passwordResetSession.emailVerified) {
			return err("REQUIRED_EMAIL_VERIFICATION");
		}

		const passwordHash = await this.passwordHasher.hash(newPassword);

		await Promise.all([
			this.userRepository.save(user, { passwordHash }),
			this.passwordResetSessionRepository.deleteByUserId(user.id),

			// Delete all sessions of the user to force them to login again.
			this.sessionRepository.deleteByUserId(user.id),
		]);

		return ok();
	}
}
