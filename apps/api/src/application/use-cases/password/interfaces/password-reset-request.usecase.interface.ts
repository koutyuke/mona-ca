import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession } from "../../../../domain/entities";

export type PasswordResetRequestUseCaseSuccessResult = {
	passwordResetSessionToken: string;
	passwordResetSession: PasswordResetSession;
};

export type PasswordResetRequestUseCaseErrorResult = Err<"EMAIL_IS_NOT_VERIFIED">;

export type PasswordResetRequestUseCaseResult = Result<
	PasswordResetRequestUseCaseSuccessResult,
	PasswordResetRequestUseCaseErrorResult
>;

export interface IPasswordResetRequestUseCase {
	execute: (email: string) => Promise<PasswordResetRequestUseCaseResult>;
}
