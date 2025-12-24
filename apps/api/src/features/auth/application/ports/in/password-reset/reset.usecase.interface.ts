import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { PasswordResetSession } from "../../../../domain/entities/password-reset-session";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";

type Success = Ok;

type Error = Err<"REQUIRED_EMAIL_VERIFICATION">;

export type PasswordResetResetUseCaseResult = Result<Success, Error>;

export interface IPasswordResetResetUseCase {
	execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
		userCredentials: UserCredentials,
	): Promise<PasswordResetResetUseCaseResult>;
}
