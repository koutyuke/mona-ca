import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession } from "../../../../domain/entities";

type Success = undefined;

type Error = Err<"INVALID_CODE">;

export type PasswordResetVerifyEmailUseCaseResult = Result<Success, Error>;

export interface IPasswordResetVerifyEmailUseCase {
	execute(code: string, passwordResetSession: PasswordResetSession): Promise<PasswordResetVerifyEmailUseCaseResult>;
}
