import { err, ok } from "@mona-ca/core/utils";
import { timingSafeStringEqual } from "../../../../../shared/lib/security";
import { completeEmailVerificationForPasswordResetSession } from "../../../domain/entities/password-reset-session";

import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type {
	IPasswordResetVerifyEmailUseCase,
	PasswordResetVerifyEmailUseCaseResult,
} from "../../contracts/password/password-reset-verify-email.usecase.interface";
import type { IPasswordResetSessionRepository } from "../../ports/repositories/password-reset-session.repository.interface";

// this use case will be called after the validate password reset session use case.
// so we don't need to check the expired password reset session.
export class PasswordResetVerifyEmailUseCase implements IPasswordResetVerifyEmailUseCase {
	constructor(private readonly passwordResetSessionRepository: IPasswordResetSessionRepository) {}

	public async execute(
		code: string,
		passwordResetSession: PasswordResetSession,
	): Promise<PasswordResetVerifyEmailUseCaseResult> {
		if (!timingSafeStringEqual(passwordResetSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		const completeSession = completeEmailVerificationForPasswordResetSession(passwordResetSession);

		await this.passwordResetSessionRepository.save(completeSession);

		return ok();
	}
}
