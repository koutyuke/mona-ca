import { err, ok } from "@mona-ca/core/utils";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { updateUserCredentials } from "../../../domain/entities/user-credentials";

import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type {
	EmailVerificationVerifyCodeUseCaseResult,
	IEmailVerificationVerifyCodeUseCase,
} from "../../contracts/email-verification/verify-code.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";

export class EmailVerificationVerifyCodeUseCase implements IEmailVerificationVerifyCodeUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
	) {}

	/**
	 * this use case will be called after the validate email verification session use case.
	 *
	 * so we don't need to check the expired email verification session.
	 */
	public async execute(
		code: string,
		userCredentials: UserCredentials,
		emailVerificationSession: EmailVerificationSession,
	): Promise<EmailVerificationVerifyCodeUseCaseResult> {
		if (!timingSafeStringEqual(emailVerificationSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		if (emailVerificationSession.email !== userCredentials.email) {
			await this.emailVerificationSessionRepository.deleteByUserId(userCredentials.id);
			return err("EMAIL_MISMATCH");
		}

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			emailVerified: true,
		});

		await Promise.all([
			this.emailVerificationSessionRepository.deleteByUserId(userCredentials.id),
			this.authUserRepository.update(updatedUserCredentials),
		]);

		return ok();
	}
}
