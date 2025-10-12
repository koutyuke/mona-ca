import { err, timingSafeStringEqual } from "../../../common/utils";
import { type PasswordResetSession, updatePasswordResetSession } from "../../../domain/entities";
import type { IPasswordResetVerifyEmailUseCase, PasswordResetVerifyEmailUseCaseResult } from "../../ports/in";
import type { IPasswordResetSessionRepository } from "../../ports/out/repositories";

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

		const updatedSession = updatePasswordResetSession(passwordResetSession, {
			emailVerified: true,
		});

		await this.passwordResetSessionRepository.save(updatedSession);

		return;
	}
}
