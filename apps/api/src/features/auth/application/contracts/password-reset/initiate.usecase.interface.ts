import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { PasswordResetSessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	passwordResetSession: PasswordResetSession;
	passwordResetSessionToken: PasswordResetSessionToken;
}>;

type Error = Err<"USER_NOT_FOUND">;

export type PasswordResetInitiateUseCaseResult = Result<Success, Error>;

export interface IPasswordResetInitiateUseCase {
	execute(email: string): Promise<PasswordResetInitiateUseCaseResult>;
}
