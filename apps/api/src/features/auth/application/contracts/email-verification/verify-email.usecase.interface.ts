import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";

type Success = Ok;

type Error = Err<"INVALID_VERIFICATION_CODE"> | Err<"EMAIL_MISMATCH">;

export type EmailVerificationVerifyEmailUseCaseResult = Result<Success, Error>;
export interface IEmailVerificationVerifyEmailUseCase {
	execute(
		code: string,
		userCredentials: UserCredentials,
		emailVerificationSession: EmailVerificationSession,
	): Promise<EmailVerificationVerifyEmailUseCaseResult>;
}
