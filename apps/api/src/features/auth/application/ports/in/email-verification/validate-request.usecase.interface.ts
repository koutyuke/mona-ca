import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { EmailVerificationRequest } from "../../../../domain/entities/email-verification-request";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { EmailVerificationRequestToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	emailVerificationRequest: EmailVerificationRequest;
}>;

type Error = Err<"INVALID_EMAIL_VERIFICATION_REQUEST"> | Err<"EXPIRED_EMAIL_VERIFICATION_REQUEST">;

export type EmailVerificationValidateRequestUseCaseResult = Result<Success, Error>;

export interface IEmailVerificationValidateRequestUseCase {
	execute(
		userCredentials: UserCredentials,
		emailVerificationRequestToken: EmailVerificationRequestToken,
	): Promise<EmailVerificationValidateRequestUseCaseResult>;
}
