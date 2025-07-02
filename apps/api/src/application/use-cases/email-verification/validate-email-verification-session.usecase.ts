import { err } from "../../../common/utils";
import { isExpiredEmailVerificationSession } from "../../../domain/entities";
import type { EmailVerificationSessionId } from "../../../domain/value-object";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import { type ISessionSecretService, separateSessionTokenToIdAndSecret } from "../../services/session";
import type {
	IValidateEmailVerificationSessionUseCase,
	ValidateEmailVerificationSessionUseCaseResult,
} from "./interfaces/validate-email-verification-session.usecase.interface";

export class ValidateEmailVerificationSessionUseCase implements IValidateEmailVerificationSessionUseCase {
	constructor(
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly emailVerificationSessionSecretService: ISessionSecretService,
	) {}

	public async execute(emailVerificationSessionToken: string): Promise<ValidateEmailVerificationSessionUseCaseResult> {
		const emailVerificationSessionIdAndSecret =
			separateSessionTokenToIdAndSecret<EmailVerificationSessionId>(emailVerificationSessionToken);

		if (!emailVerificationSessionIdAndSecret) {
			return err("INVALID_TOKEN");
		}

		const { id: emailVerificationSessionId, secret: emailVerificationSessionSecret } =
			emailVerificationSessionIdAndSecret;

		const emailVerificationSession = await this.emailVerificationSessionRepository.findById(emailVerificationSessionId);

		if (!emailVerificationSession) {
			return err("INVALID_TOKEN");
		}

		if (isExpiredEmailVerificationSession(emailVerificationSession)) {
			return err("EXPIRED_CODE");
		}

		if (
			!this.emailVerificationSessionSecretService.verifySessionSecret(
				emailVerificationSessionSecret,
				emailVerificationSession.secretHash,
			)
		) {
			return err("INVALID_TOKEN");
		}

		return { emailVerificationSession };
	}
}
