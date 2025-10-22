import { err, ok } from "@mona-ca/core/utils";
import { updateUserIdentity } from "../../../domain/entities/user-identity";

import type { IPasswordHasher } from "../../../../../core/ports/system";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type {
	IResetPasswordUseCase,
	ResetPasswordUseCaseResult,
} from "../../contracts/password/reset-password.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IPasswordResetSessionRepository } from "../../ports/repositories/password-reset-session.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

// this use case will be called after the validate password reset session use case.
// so we don't need to check the expired password reset session.
export class ResetPasswordUseCase implements IResetPasswordUseCase {
	constructor(
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly passwordHasher: IPasswordHasher,
	) {}

	public async execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
		userIdentity: UserIdentity,
	): Promise<ResetPasswordUseCaseResult> {
		if (!passwordResetSession.emailVerified) {
			return err("REQUIRED_EMAIL_VERIFICATION");
		}

		const passwordHash = await this.passwordHasher.hash(newPassword);

		const updatedUserIdentity = updateUserIdentity(userIdentity, {
			passwordHash,
		});

		await Promise.all([
			this.authUserRepository.update(updatedUserIdentity),
			this.passwordResetSessionRepository.deleteByUserId(userIdentity.id),

			// Delete all sessions of the user to force them to login again.
			this.sessionRepository.deleteByUserId(userIdentity.id),
		]);

		return ok();
	}
}
