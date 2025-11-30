import { err, ok } from "@mona-ca/core/utils";
import { updateUserCredentials } from "../../../domain/entities/user-credentials";

import type { IPasswordHashingService } from "../../../../../core/ports/system";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type {
	IPasswordResetCompleteUseCase,
	PasswordResetCompleteUseCaseResult,
} from "../../contracts/password-reset/complete.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IPasswordResetSessionRepository } from "../../ports/repositories/password-reset-session.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

// this use case will be called after the validate password reset session use case.
// so we don't need to check the expired password reset session.
export class PasswordResetCompleteUseCase implements IPasswordResetCompleteUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly sessionRepository: ISessionRepository,
		// system
		private readonly passwordHashingService: IPasswordHashingService,
	) {}

	public async execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
		userCredentials: UserCredentials,
	): Promise<PasswordResetCompleteUseCaseResult> {
		if (!passwordResetSession.emailVerified) {
			return err("REQUIRED_EMAIL_VERIFICATION");
		}

		const passwordHash = await this.passwordHashingService.hash(newPassword);

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			passwordHash,
		});

		await Promise.all([
			this.authUserRepository.update(updatedUserCredentials),
			this.passwordResetSessionRepository.deleteByUserId(userCredentials.id),

			// Delete all sessions of the user to force them to login again.
			this.sessionRepository.deleteByUserId(userCredentials.id),
		]);

		return ok();
	}
}
