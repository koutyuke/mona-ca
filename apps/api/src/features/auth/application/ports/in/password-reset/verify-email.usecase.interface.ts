import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { PasswordResetSession } from "../../../../domain/entities/password-reset-session";

type Success = Ok;

type Error = Err<"INVALID_VERIFICATION_CODE">;

export type PasswordResetVerifyEmailUseCaseResult = Result<Success, Error>;

export interface IPasswordResetVerifyEmailUseCase {
	execute(code: string, passwordResetSession: PasswordResetSession): Promise<PasswordResetVerifyEmailUseCaseResult>;
}
