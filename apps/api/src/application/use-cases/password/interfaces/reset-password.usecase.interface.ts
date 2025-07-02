import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession } from "../../../../domain/entities";

type Success = undefined;

type Error = Err<"INVALID_TOKEN"> | Err<"EXPIRED_TOKEN"> | Err<"EMAIL_NOT_VERIFIED">;

export type ResetPasswordUseCaseResult = Result<Success, Error>;

export interface IResetPasswordUseCase {
	execute(newPassword: string, passwordResetSession: PasswordResetSession): Promise<ResetPasswordUseCaseResult>;
}
