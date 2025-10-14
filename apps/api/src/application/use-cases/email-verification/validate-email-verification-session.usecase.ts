import { err, ok } from "@mona-ca/core/utils";
import { type User, isExpiredEmailVerificationSession } from "../../../domain/entities";
import type { EmailVerificationSessionToken } from "../../../domain/value-object";
import { parseSessionToken } from "../../../domain/value-object";
import type {
	IValidateEmailVerificationSessionUseCase,
	ValidateEmailVerificationSessionUseCaseResult,
} from "../../ports/in";
import type { IEmailVerificationSessionRepository } from "../../ports/out/repositories";
import type { ISessionSecretHasher } from "../../ports/out/system";

export class ValidateEmailVerificationSessionUseCase implements IValidateEmailVerificationSessionUseCase {
	constructor(
		private readonly emailVerificationSessionRepository: IEmailVerificationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

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

		if (!this.sessionSecretHasher.verify(emailVerificationSessionSecret, emailVerificationSession.secretHash)) {
			return err("EMAIL_VERIFICATION_SESSION_INVALID");
		}

		return ok({ emailVerificationSession });
	}
}
