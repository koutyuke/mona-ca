import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/session-token";

export type Success = Ok<{
	emailVerificationSessionToken: EmailVerificationSessionToken;
	emailVerificationSession: EmailVerificationSession;
}>;

export type Error = Err<"EMAIL_ALREADY_VERIFIED"> | Err<"EMAIL_ALREADY_REGISTERED">;

export type EmailVerificationRequestUseCaseResult = Result<Success, Error>;

export interface IEmailVerificationRequestUseCase {
	execute(email: string, userIdentity: UserIdentity): Promise<EmailVerificationRequestUseCaseResult>;
}
