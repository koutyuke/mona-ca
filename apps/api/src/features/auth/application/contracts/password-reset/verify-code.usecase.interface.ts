import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";

type Success = Ok;

type Error = Err<"INVALID_VERIFICATION_CODE">;

export type PasswordResetVerifyCodeUseCaseResult = Result<Success, Error>;

export interface IPasswordResetVerifyCodeUseCase {
	execute(code: string, passwordResetSession: PasswordResetSession): Promise<PasswordResetVerifyCodeUseCaseResult>;
}
