import { err } from "../../../common/utils";
import { isExpiredPasswordResetSession } from "../../../domain/entities";
import type { PasswordResetSessionId } from "../../../domain/value-object";
import type { IPasswordResetSessionRepository } from "../../../interface-adapter/repositories/password-reset-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, separateSessionTokenToIdAndSecret } from "../../services/session";
import type {
	IValidatePasswordResetSessionUseCase,
	ValidatePasswordResetSessionUseCaseResult,
} from "./interfaces/validate-password-reset-session.usecase.interface";

export class ValidatePasswordResetSessionUseCase implements IValidatePasswordResetSessionUseCase {
	constructor(
		private readonly passwordResetSessionRepository: IPasswordResetSessionRepository,
		private readonly passwordResetSessionSecretService: ISessionSecretService,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(passwordResetSessionToken: string): Promise<ValidatePasswordResetSessionUseCaseResult> {
		const passwordResetSessionIdAndSecret =
			separateSessionTokenToIdAndSecret<PasswordResetSessionId>(passwordResetSessionToken);

		if (!passwordResetSessionIdAndSecret) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		const { id: passwordResetSessionId, secret: passwordResetSessionSecret } = passwordResetSessionIdAndSecret;

		const passwordResetSession = await this.passwordResetSessionRepository.findById(passwordResetSessionId);

		if (!passwordResetSession) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		const user = await this.userRepository.findById(passwordResetSession.userId);

		if (!user) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (passwordResetSession.userId !== user.id) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (
			!this.passwordResetSessionSecretService.verifySessionSecret(
				passwordResetSessionSecret,
				passwordResetSession.secretHash,
			)
		) {
			return err("PASSWORD_RESET_SESSION_INVALID");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			await this.passwordResetSessionRepository.deleteById(passwordResetSessionId);
			return err("PASSWORD_RESET_SESSION_EXPIRED");
		}

		return { passwordResetSession, user };
	}
}
