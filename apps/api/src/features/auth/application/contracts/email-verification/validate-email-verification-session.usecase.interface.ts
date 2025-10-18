import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { EmailVerificationSessionToken } from "../../../../../../common/domain/value-objects";
import type { EmailVerificationSession, User } from "../../../../domain/entities";

type Success = Ok<{
	emailVerificationSession: EmailVerificationSession;
}>;

type Error = Err<"EMAIL_VERIFICATION_SESSION_INVALID"> | Err<"EMAIL_VERIFICATION_SESSION_EXPIRED">;

export type ValidateEmailVerificationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateEmailVerificationSessionUseCase {
	execute(
		emailVerificationSessionToken: EmailVerificationSessionToken,
		user: User,
	): Promise<ValidateEmailVerificationSessionUseCaseResult>;
}
