import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession, User } from "../../../../domain/entities";

type Success = {
	passwordResetSession: PasswordResetSession;
	user: User;
};

type Error = Err<"PASSWORD_RESET_SESSION_INVALID"> | Err<"PASSWORD_RESET_SESSION_EXPIRED">;

export type ValidatePasswordResetSessionUseCaseResult = Result<Success, Error>;

export interface IValidatePasswordResetSessionUseCase {
	execute(passwordResetSessionToken: string): Promise<ValidatePasswordResetSessionUseCaseResult>;
}
