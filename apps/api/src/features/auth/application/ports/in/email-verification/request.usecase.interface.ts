import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { EmailVerificationRequest } from "../../../../domain/entities/email-verification-request";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { EmailVerificationRequestToken } from "../../../../domain/value-objects/tokens";

export type Success = Ok<{
	emailVerificationRequest: EmailVerificationRequest;
	emailVerificationRequestToken: EmailVerificationRequestToken;
}>;

export type Error = Err<"EMAIL_ALREADY_VERIFIED"> | Err<"EMAIL_ALREADY_REGISTERED">;

export type EmailVerificationRequestUseCaseResult = Result<Success, Error>;

export interface IEmailVerificationRequestUseCase {
	execute(userCredentials: UserCredentials): Promise<EmailVerificationRequestUseCaseResult>;
}
