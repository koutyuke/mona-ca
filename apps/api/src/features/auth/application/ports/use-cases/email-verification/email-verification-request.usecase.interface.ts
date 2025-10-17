import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSessionToken } from "../../../../../../common/domain/value-objects";
import type { EmailVerificationSession, User } from "../../../../domain/entities";

export type Success = Ok<{
	emailVerificationSessionToken: EmailVerificationSessionToken;
	emailVerificationSession: EmailVerificationSession;
}>;

export type Error = Err<"EMAIL_ALREADY_VERIFIED"> | Err<"EMAIL_ALREADY_REGISTERED">;

export type EmailVerificationRequestUseCaseResult = Result<Success, Error>;

export interface IEmailVerificationRequestUseCase {
	execute(email: string, user: User): Promise<EmailVerificationRequestUseCaseResult>;
}
