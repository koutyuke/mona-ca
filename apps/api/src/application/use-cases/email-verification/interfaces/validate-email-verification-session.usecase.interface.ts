import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession, User } from "../../../../domain/entities";

type Success = {
	emailVerificationSession: EmailVerificationSession;
};

type Error = Err<"INVALID_EMAIL_VERIFICATION_SESSION"> | Err<"EXPIRED_EMAIL_VERIFICATION_SESSION">;

export type ValidateEmailVerificationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateEmailVerificationSessionUseCase {
	execute(emailVerificationSessionToken: string, user: User): Promise<ValidateEmailVerificationSessionUseCaseResult>;
}
