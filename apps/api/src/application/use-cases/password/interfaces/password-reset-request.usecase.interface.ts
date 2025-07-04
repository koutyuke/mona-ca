import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession } from "../../../../domain/entities";

type Success = {
	passwordResetSessionToken: string;
	passwordResetSession: PasswordResetSession;
};

type Error = Err<"USER_NOT_FOUND">;

export type PasswordResetRequestUseCaseResult = Result<Success, Error>;

export interface IPasswordResetRequestUseCase {
	execute: (email: string) => Promise<PasswordResetRequestUseCaseResult>;
}
