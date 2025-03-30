import type { Err, Result } from "../../../../common/utils";

export type ResetPasswordUseCaseSuccessResult = undefined;

export type ResetPasswordUseCaseErrorResult = Err<"INVALID_TOKEN"> | Err<"TOKEN_EXPIRED"> | Err<"EMAIL_NOT_VERIFIED">;

export type ResetPasswordUseCaseResult = Result<ResetPasswordUseCaseSuccessResult, ResetPasswordUseCaseErrorResult>;

export interface IResetPasswordUseCase {
	execute(passwordResetSessionToken: string, newPassword: string): Promise<ResetPasswordUseCaseResult>;
}
