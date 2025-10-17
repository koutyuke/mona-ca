import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSessionToken } from "../../../../../../common/domain/value-objects";
import type { PasswordResetSession, User } from "../../../../domain/entities";

type Success = Ok<{
	passwordResetSession: PasswordResetSession;
	user: User;
}>;

type Error = Err<"PASSWORD_RESET_SESSION_INVALID"> | Err<"PASSWORD_RESET_SESSION_EXPIRED">;

export type ValidatePasswordResetSessionUseCaseResult = Result<Success, Error>;

export interface IValidatePasswordResetSessionUseCase {
	execute(passwordResetSessionToken: PasswordResetSessionToken): Promise<ValidatePasswordResetSessionUseCaseResult>;
}
