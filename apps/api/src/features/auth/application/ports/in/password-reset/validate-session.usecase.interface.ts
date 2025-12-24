import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { PasswordResetSession } from "../../../../domain/entities/password-reset-session";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { PasswordResetSessionToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	passwordResetSession: PasswordResetSession;
	userCredentials: UserCredentials;
}>;

type Error = Err<"INVALID_PASSWORD_RESET_SESSION"> | Err<"EXPIRED_PASSWORD_RESET_SESSION">;

export type PasswordResetValidateSessionUseCaseResult = Result<Success, Error>;

export interface IPasswordResetValidateSessionUseCase {
	execute(passwordResetSessionToken: PasswordResetSessionToken): Promise<PasswordResetValidateSessionUseCaseResult>;
}
