import { err } from "../../../common/utils";
import { type User, isExpiredEmailVerificationSession } from "../../../domain/entities";
import type { EmailVerificationSessionToken } from "../../../domain/value-object";
import { parseSessionToken } from "../../../domain/value-object";
import { verifySessionSecret } from "../../../infrastructure/crypt";
import type { IEmailVerificationSessionRepository } from "../../../interface-adapter/repositories/email-verification-session";
import type {
	IValidateEmailVerificationSessionUseCase,
	ValidateEmailVerificationSessionUseCaseResult,
} from "./interfaces/validate-email-verification-session.usecase.interface";

export class ValidateEmailVerificationSessionUseCase implements IValidateEmailVerificationSessionUseCase {
	constructor(private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository) {}

	public async execute(
		emailVerificationSessionToken: EmailVerificationSessionToken,
		user: User,
	): Promise<ValidateEmailVerificationSessionUseCaseResult> {
		const emailVerificationSessionIdAndSecret = parseSessionToken(emailVerificationSessionToken);

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

		if (!verifySessionSecret(emailVerificationSessionSecret, emailVerificationSession.secretHash)) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		return { emailVerificationSession };
	}
}
