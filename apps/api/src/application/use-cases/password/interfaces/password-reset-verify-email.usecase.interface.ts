import type { Err, Result } from "../../../../common/utils";

export type PasswordResetVerifyEmailUseCaseSuccessResult = undefined;

export type PasswordResetVerifyEmailUseCaseErrorResult =
	| Err<"INVALID_TOKEN">
	| Err<"TOKEN_EXPIRED">
	| Err<"INVALID_CODE">;

export type PasswordResetVerifyEmailUseCaseResult = Result<
	PasswordResetVerifyEmailUseCaseSuccessResult,
	PasswordResetVerifyEmailUseCaseErrorResult
>;

export interface IPasswordResetVerifyEmailUseCase {
	execute(passwordResetSessionToken: string, code: string): Promise<PasswordResetVerifyEmailUseCaseResult>;
}
