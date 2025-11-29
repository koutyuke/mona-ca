import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { PasswordResetSessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	passwordResetSession: PasswordResetSession;
	userCredentials: UserCredentials;
}>;

type Error = Err<"PASSWORD_RESET_SESSION_INVALID"> | Err<"PASSWORD_RESET_SESSION_EXPIRED">;

export type PasswordResetValidateSessionUseCaseResult = Result<Success, Error>;

export interface IPasswordResetValidateSessionUseCase {
	execute(passwordResetSessionToken: PasswordResetSessionToken): Promise<PasswordResetValidateSessionUseCaseResult>;
}
