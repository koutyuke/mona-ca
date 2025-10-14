import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSession } from "../../../../domain/entities";
import type { PasswordResetSessionToken } from "../../../../domain/value-object";

type Success = Ok<{
	passwordResetSessionToken: PasswordResetSessionToken;
	passwordResetSession: PasswordResetSession;
}>;

type Error = Err<"USER_NOT_FOUND">;

export type PasswordResetRequestUseCaseResult = Result<Success, Error>;

export interface IPasswordResetRequestUseCase {
	execute: (email: string) => Promise<PasswordResetRequestUseCaseResult>;
}
