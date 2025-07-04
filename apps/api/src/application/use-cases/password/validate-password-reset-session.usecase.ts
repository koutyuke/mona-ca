import { err } from "../../../common/utils";
import { type User, isExpiredPasswordResetSession } from "../../../domain/entities";
import type { PasswordResetSessionId } from "../../../domain/value-object";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import { type ISessionSecretService, separateSessionTokenToIdAndSecret } from "../../services/session";
import type {
	IValidatePasswordResetSessionUseCase,
	ValidatePasswordResetSessionUseCaseResult,
} from "./interfaces/validate-password-reset-session.interface.usecase";

export class ValidatePasswordResetSessionUseCase implements IValidatePasswordResetSessionUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly passwordResetSessionSecretService: ISessionSecretService,
	) {}

	public async execute(
		passwordResetSessionToken: string,
		user: User,
	): Promise<ValidatePasswordResetSessionUseCaseResult> {
		const passwordResetSessionIdAndSecret =
			separateSessionTokenToIdAndSecret<PasswordResetSessionId>(passwordResetSessionToken);

		if (!passwordResetSessionIdAndSecret) {
			return err("INVALID_PASSWORD_RESET_SESSION");
		}

		const { id: passwordResetSessionId, secret: passwordResetSessionSecret } = passwordResetSessionIdAndSecret;

		const passwordResetSession = await this.passwordResetSessionRepository.findById(passwordResetSessionId);

		if (!passwordResetSession) {
			return err("INVALID_PASSWORD_RESET_SESSION");
		}

		if (passwordResetSession.userId !== user.id) {
			return err("INVALID_PASSWORD_RESET_SESSION");
		}

		if (
			!this.passwordResetSessionSecretService.verifySessionSecret(
				passwordResetSessionSecret,
				passwordResetSession.secretHash,
			)
		) {
			return err("INVALID_PASSWORD_RESET_SESSION");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("EXPIRED_PASSWORD_RESET_SESSION");
		}

		return { passwordResetSession };
	}
}
