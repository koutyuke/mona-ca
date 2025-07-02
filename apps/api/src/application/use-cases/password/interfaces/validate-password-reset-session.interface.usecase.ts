import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession } from "../../../../domain/entities";

type Success = {
	passwordResetSession: PasswordResetSession;
};

type Error = Err<"INVALID_TOKEN"> | Err<"EXPIRED_CODE">;

export type ValidatePasswordResetSessionUseCaseResult = Result<Success, Error>;

export interface IValidatePasswordResetSessionUseCase {
	execute(passwordResetSessionToken: string): Promise<ValidatePasswordResetSessionUseCaseResult>;
}
