import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	emailVerificationSession: EmailVerificationSession;
}>;

type Error = Err<"EMAIL_VERIFICATION_SESSION_INVALID"> | Err<"EMAIL_VERIFICATION_SESSION_EXPIRED">;

export type EmailVerificationValidateSessionUseCaseResult = Result<Success, Error>;

export interface IEmailVerificationValidateSessionUseCase {
	execute(
		userCredentials: UserCredentials,
		emailVerificationSessionToken: EmailVerificationSessionToken,
	): Promise<EmailVerificationValidateSessionUseCaseResult>;
}
