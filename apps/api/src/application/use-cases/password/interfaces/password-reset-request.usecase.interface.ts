import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession } from "../../../../domain/entities";
import type { PasswordResetSessionToken } from "../../../../domain/value-object";

type Success = {
	passwordResetSessionToken: PasswordResetSessionToken;
	passwordResetSession: PasswordResetSession;
};

type Error = Err<"USER_NOT_FOUND">;

export type PasswordResetRequestUseCaseResult = Result<Success, Error>;

export interface IPasswordResetRequestUseCase {
	execute: (email: string) => Promise<PasswordResetRequestUseCaseResult>;
}
