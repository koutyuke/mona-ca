import { constantTimeCompare, err } from "../../../common/utils";
import {
	type PasswordResetSession,
	isExpiredPasswordResetSession,
	updatePasswordResetSession,
} from "../../../domain/entities";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type {
	IPasswordResetVerifyEmailUseCase,
	PasswordResetVerifyEmailUseCaseResult,
} from "./interfaces/password-reset-verify-email.usecase.interface";

export class PasswordResetVerifyEmailUseCase implements IPasswordResetVerifyEmailUseCase {
	constructor(private readonly passwordResetSessionRepository: IPasswordResetSessionRepository) {}

	public async execute(
		code: string,
		passwordResetSession: PasswordResetSession,
	): Promise<PasswordResetVerifyEmailUseCaseResult> {
		if (isExpiredPasswordResetSession(passwordResetSession)) {
			return err("EXPIRED_CODE");
		}

		if (!constantTimeCompare(passwordResetSession.code, code)) {
			return err("INVALID_CODE");
		}

		const updatedSession = updatePasswordResetSession(passwordResetSession, {
			emailVerified: true,
		});

		await this.passwordResetSessionRepository.save(updatedSession);

		return;
	}
}
