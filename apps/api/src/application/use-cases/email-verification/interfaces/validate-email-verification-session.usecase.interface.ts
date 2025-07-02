import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession } from "../../../../domain/entities";

type Success = {
	emailVerificationSession: EmailVerificationSession;
};

type Error = Err<"INVALID_TOKEN"> | Err<"EXPIRED_CODE">;

export type ValidateEmailVerificationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateEmailVerificationSessionUseCase {
	execute(emailVerificationSessionToken: string): Promise<ValidateEmailVerificationSessionUseCaseResult>;
}
