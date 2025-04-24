import { constantTimeCompare, err } from "../../../common/utils";
import { isExpiredPasswordResetSession, updatePasswordResetSession } from "../../../domain/entities";
import { newPasswordResetSessionId } from "../../../domain/value-object";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	IPasswordResetVerifyEmailUseCase,
	PasswordResetVerifyEmailUseCaseResult,
} from "./interfaces/password-reset-verify-email.usecase.interface";

export class PasswordResetVerifyEmailUseCase implements IPasswordResetVerifyEmailUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly passwordResetSessionTokenService: ISessionTokenService,
	) {}

	public async execute(
		passwordResetSessionToken: string,
		code: string,
	): Promise<PasswordResetVerifyEmailUseCaseResult> {
		const passwordResetSessionId = newPasswordResetSessionId(
			this.passwordResetSessionTokenService.hashSessionToken(passwordResetSessionToken),
		);
		const passwordResetSession = await this.passwordResetSessionRepository.findById(passwordResetSessionId);

		if (passwordResetSession === null) {
			return err("INVALID_TOKEN");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			return err("EXPIRED_TOKEN");
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
