import { err, ok } from "@mona-ca/core/result";
import { isExpiredEmailVerificationSession } from "../../../domain/entities/email-verification-session";
import { decodeToken } from "../../../domain/value-objects/tokens";

import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/tokens";
import type {
	EmailVerificationValidateSessionUseCaseResult,
	IEmailVerificationValidateSessionUseCase,
} from "../../contracts/email-verification/validate-email-verification-session.usecase.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";

export class EmailVerificationValidateSessionUseCase implements IEmailVerificationValidateSessionUseCase {
	constructor(
		// repositories
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		userCredentials: UserCredentials,
		emailVerificationSessionToken: EmailVerificationSessionToken,
	): Promise<EmailVerificationValidateSessionUseCaseResult> {
		const emailVerificationSessionIdAndSecret = decodeToken(emailVerificationSessionToken);

		if (!emailVerificationSessionIdAndSecret) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		const { id: emailVerificationSessionId, secret: emailVerificationSessionSecret } =
			emailVerificationSessionIdAndSecret;

		const emailVerificationSession = await this.emailVerificationSessionRepository.findById(emailVerificationSessionId);

		if (!emailVerificationSession) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		if (emailVerificationSession.userId !== userCredentials.id) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		if (!this.tokenSecretService.verify(emailVerificationSessionSecret, emailVerificationSession.secretHash)) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		if (isExpiredEmailVerificationSession(emailVerificationSession)) {
			await this.emailVerificationSessionRepository.deleteByUserId(emailVerificationSession.userId);
			return err("EMAIL_VERIFICATION_SESSION_EXPIRED");
		}

		return ok({ emailVerificationSession });
	}
}
