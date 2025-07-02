import { err } from "../../../common/utils";
import { isExpiredPasswordResetSession } from "../../../domain/entities";
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

	public async execute(passwordResetSessionToken: string): Promise<ValidatePasswordResetSessionUseCaseResult> {
		const passwordResetSessionIdAndSecret =
			separateSessionTokenToIdAndSecret<PasswordResetSessionId>(passwordResetSessionToken);

		if (!passwordResetSessionIdAndSecret) {
			return err("INVALID_TOKEN");
		}

		const { id: passwordResetSessionId, secret: passwordResetSessionSecret } = passwordResetSessionIdAndSecret;

		const passwordResetSession = await this.passwordResetSessionRepository.findById(passwordResetSessionId);

		if (!passwordResetSession) {
			return err("INVALID_TOKEN");
		}

		if (
			!this.passwordResetSessionSecretService.verifySessionSecret(
				passwordResetSessionSecret,
				passwordResetSession.secretHash,
			)
		) {
			return err("INVALID_TOKEN");
		}

		if (isExpiredPasswordResetSession(passwordResetSession)) {
			return err("EXPIRED_CODE");
		}

		return { passwordResetSession };
	}
}
