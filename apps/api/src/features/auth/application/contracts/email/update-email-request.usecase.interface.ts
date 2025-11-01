import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	emailVerificationSessionToken: EmailVerificationSessionToken;
	emailVerificationSession: EmailVerificationSession;
}>;

type Error = Err<"EMAIL_ALREADY_REGISTERED">;

export type UpdateEmailRequestUseCaseResult = Result<Success, Error>;

export interface IUpdateEmailRequestUseCase {
	execute(email: string, userIdentity: UserIdentity): Promise<UpdateEmailRequestUseCaseResult>;
}
