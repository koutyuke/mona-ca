import { err } from "../../../common/utils";
import { type User, isExpiredEmailVerificationSession } from "../../../domain/entities";
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

	public async execute(
		emailVerificationSessionToken: string,
		user: User,
	): Promise<ValidateEmailVerificationSessionUseCaseResult> {
		const emailVerificationSessionIdAndSecret =
			separateSessionTokenToIdAndSecret<EmailVerificationSessionId>(emailVerificationSessionToken);

		if (!emailVerificationSessionIdAndSecret) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		const { id: emailVerificationSessionId, secret: emailVerificationSessionSecret } =
			emailVerificationSessionIdAndSecret;

		const emailVerificationSession = await this.emailVerificationSessionRepository.findById(emailVerificationSessionId);

		if (!emailVerificationSession) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		if (emailVerificationSession.userId !== user.id) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		if (isExpiredEmailVerificationSession(emailVerificationSession)) {
			await this.emailVerificationSessionRepository.deleteByUserId(emailVerificationSession.userId);
			return err("EMAIL_VERIFICATION_SESSION_EXPIRED");
		}

		if (
			!this.emailVerificationSessionSecretService.verifySessionSecret(
				emailVerificationSessionSecret,
				emailVerificationSession.secretHash,
			)
		) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		return { emailVerificationSession };
	}
}
