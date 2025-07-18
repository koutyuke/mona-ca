import { err, timingSafeStringEqual } from "../../../common/utils";
import { type PasswordResetSession, updatePasswordResetSession } from "../../../domain/entities";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type {
	IPasswordResetVerifyEmailUseCase,
	PasswordResetVerifyEmailUseCaseResult,
} from "./interfaces/password-reset-verify-email.usecase.interface";

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
