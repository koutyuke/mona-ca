import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/tokens";

export type Success = Ok<{
	emailVerificationSession: EmailVerificationSession;
	emailVerificationSessionToken: EmailVerificationSessionToken;
}>;

export type Error = Err<"EMAIL_ALREADY_VERIFIED"> | Err<"EMAIL_ALREADY_REGISTERED">;

export type EmailVerificationRequestUseCaseResult = Result<Success, Error>;

export interface IEmailVerificationRequestUseCase {
	execute(userCredentials: UserCredentials): Promise<EmailVerificationRequestUseCaseResult>;
}
