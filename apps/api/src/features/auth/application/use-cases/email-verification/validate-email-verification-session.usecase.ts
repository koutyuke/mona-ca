import { err, ok } from "@mona-ca/core/utils";
import { isExpiredEmailVerificationSession } from "../../../domain/entities/email-verification-session";
import { parseAnySessionToken } from "../../../domain/value-objects/session-token";

import type { ISessionSecretHasher } from "../../../../../core/ports/system";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/session-token";
import type {
	IValidateEmailVerificationSessionUseCase,
	ValidateEmailVerificationSessionUseCaseResult,
} from "../../contracts/email-verification/validate-email-verification-session.usecase.interface";
import type { IEmailVerificationSessionRepository } from "../../ports/repositories/email-verification-session.repository.interface";

export class ValidateEmailVerificationSessionUseCase implements IValidateEmailVerificationSessionUseCase {
	constructor(
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(
		userIdentity: UserIdentity,
		emailVerificationSessionToken: EmailVerificationSessionToken,
	): Promise<ValidateEmailVerificationSessionUseCaseResult> {
		const emailVerificationSessionIdAndSecret = parseAnySessionToken(emailVerificationSessionToken);

		if (!emailVerificationSessionIdAndSecret) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		const { id: emailVerificationSessionId, secret: emailVerificationSessionSecret } =
			emailVerificationSessionIdAndSecret;

		const emailVerificationSession = await this.emailVerificationSessionRepository.findById(emailVerificationSessionId);

		if (!emailVerificationSession) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		if (emailVerificationSession.userId !== userIdentity.id) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		if (isExpiredEmailVerificationSession(emailVerificationSession)) {
			await this.emailVerificationSessionRepository.deleteByUserId(emailVerificationSession.userId);
			return err("EMAIL_VERIFICATION_SESSION_EXPIRED");
		}

		if (!this.sessionSecretHasher.verify(emailVerificationSessionSecret, emailVerificationSession.secretHash)) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		return ok({ emailVerificationSession });
	}
}
