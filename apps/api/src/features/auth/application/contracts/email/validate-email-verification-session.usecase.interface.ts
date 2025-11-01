import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSession } from "../../../domain/entities/email-verification-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { EmailVerificationSessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	emailVerificationSession: EmailVerificationSession;
}>;

type Error = Err<"EMAIL_VERIFICATION_SESSION_INVALID"> | Err<"EMAIL_VERIFICATION_SESSION_EXPIRED">;

export type ValidateEmailVerificationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateEmailVerificationSessionUseCase {
	execute(
		userIdentity: UserIdentity,
		emailVerificationSessionToken: EmailVerificationSessionToken,
	): Promise<ValidateEmailVerificationSessionUseCaseResult>;
}
