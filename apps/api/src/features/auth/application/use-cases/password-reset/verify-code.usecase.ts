import { err, ok } from "@mona-ca/core/result";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { completeEmailVerificationForPasswordResetSession } from "../../../domain/entities/password-reset-session";

import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type {
	IPasswordResetVerifyCodeUseCase,
	PasswordResetVerifyCodeUseCaseResult,
} from "../../contracts/password-reset/verify-code.usecase.interface";
import type { IPasswordResetSessionRepository } from "../../ports/repositories/password-reset-session.repository.interface";

// this use case will be called after the validate password reset session use case.
// so we don't need to check the expired password reset session.
export class PasswordResetVerifyCodeUseCase implements IPasswordResetVerifyCodeUseCase {
	constructor(private readonly passwordResetSessionRepository: IPasswordResetSessionRepository) {}

	public async execute(
		code: string,
		passwordResetSession: PasswordResetSession,
	): Promise<PasswordResetVerifyCodeUseCaseResult> {
		if (!timingSafeStringEqual(passwordResetSession.code, code)) {
			return err("INVALID_VERIFICATION_CODE");
		}

		const completedSession = completeEmailVerificationForPasswordResetSession(passwordResetSession);

		await this.passwordResetSessionRepository.save(completedSession);

		return ok();
	}
}
