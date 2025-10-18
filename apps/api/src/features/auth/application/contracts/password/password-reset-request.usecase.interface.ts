import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { PasswordResetSessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	passwordResetSession: PasswordResetSession;
	passwordResetSessionToken: PasswordResetSessionToken;
}>;

type Error = Err<"USER_NOT_FOUND">;

export type PasswordResetRequestUseCaseResult = Result<Success, Error>;

export interface IPasswordResetRequestUseCase {
	execute: (email: string) => Promise<PasswordResetRequestUseCaseResult>;
}
