import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { EmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import type { UserCredentials } from "../../../domain/entities/user-credentials";

type Success = Ok;

type Error = Err<"INVALID_CODE"> | Err<"INVALID_EMAIL">;

export type EmailVerificationVerifyEmailUseCaseResult = Result<Success, Error>;
export interface IEmailVerificationVerifyEmailUseCase {
	execute(
		code: string,
		userCredentials: UserCredentials,
		emailVerificationRequest: EmailVerificationRequest,
	): Promise<EmailVerificationVerifyEmailUseCaseResult>;
}
