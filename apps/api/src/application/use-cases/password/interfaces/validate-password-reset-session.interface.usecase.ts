import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession, User } from "../../../../domain/entities";

type Success = {
	passwordResetSession: PasswordResetSession;
};

type Error = Err<"INVALID_PASSWORD_RESET_SESSION"> | Err<"EXPIRED_PASSWORD_RESET_SESSION">;

export type ValidatePasswordResetSessionUseCaseResult = Result<Success, Error>;

export interface IValidatePasswordResetSessionUseCase {
	execute(passwordResetSessionToken: string, user: User): Promise<ValidatePasswordResetSessionUseCaseResult>;
}
