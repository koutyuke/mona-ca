import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSessionToken } from "../../../../../../common/domain/value-objects";
import type { PasswordResetSession } from "../../../../domain/entities";

type Success = Ok<{
	passwordResetSessionToken: PasswordResetSessionToken;
	passwordResetSession: PasswordResetSession;
}>;

type Error = Err<"USER_NOT_FOUND">;

export type PasswordResetRequestUseCaseResult = Result<Success, Error>;

export interface IPasswordResetRequestUseCase {
	execute: (email: string) => Promise<PasswordResetRequestUseCaseResult>;
}
