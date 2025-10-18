import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSession } from "../../../domain/entities/password-reset-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";

type Success = Ok;

type Error = Err<"REQUIRED_EMAIL_VERIFICATION">;

export type ResetPasswordUseCaseResult = Result<Success, Error>;

export interface IResetPasswordUseCase {
	execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
		userIdentity: UserIdentity,
	): Promise<ResetPasswordUseCaseResult>;
}
