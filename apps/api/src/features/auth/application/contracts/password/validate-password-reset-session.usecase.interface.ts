import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { PasswordResetSessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	passwordResetSession: PasswordResetSession;
	userIdentity: UserIdentity;
}>;

type Error = Err<"PASSWORD_RESET_SESSION_INVALID"> | Err<"PASSWORD_RESET_SESSION_EXPIRED">;

export type ValidatePasswordResetSessionUseCaseResult = Result<Success, Error>;

export interface IValidatePasswordResetSessionUseCase {
	execute(passwordResetSessionToken: PasswordResetSessionToken): Promise<ValidatePasswordResetSessionUseCaseResult>;
}
