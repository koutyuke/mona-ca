import { err, ok } from "@mona-ca/core/utils";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { updateUserIdentity } from "../../../domain/entities/user-identity";

import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type {
	EmailVerificationConfirmUseCaseResult,
	IEmailVerificationConfirmUseCase,
} from "../../contracts/email/email-verification-confirm.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";

export class EmailVerificationConfirmUseCase implements IEmailVerificationConfirmUseCase {
	constructor(
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
		userIdentity: UserIdentity,
		emailVerificationSession: EmailVerificationSession,
	): Promise<EmailVerificationConfirmUseCaseResult> {
		if (emailVerificationSession.email !== userIdentity.email) {
			await this.emailVerificationSessionRepository.deleteByUserId(userIdentity.id);
			return err("EMAIL_MISMATCH");
		}

		if (!timingSafeStringEqual(emailVerificationSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		const updatedUserIdentity = updateUserIdentity(userIdentity, {
			emailVerified: true,
		});

		await Promise.all([
			this.emailVerificationSessionRepository.deleteByUserId(userIdentity.id),
			this.authUserRepository.update(updatedUserIdentity),
		]);

		return ok();
	}
}
