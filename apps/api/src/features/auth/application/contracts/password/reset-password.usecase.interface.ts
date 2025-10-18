import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { PasswordResetSession, User } from "../../../../domain/entities";

type Success = Ok;

type Error = Err<"REQUIRED_EMAIL_VERIFICATION">;

export type ResetPasswordUseCaseResult = Result<Success, Error>;

export interface IResetPasswordUseCase {
	execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
		user: User,
	): Promise<ResetPasswordUseCaseResult>;
}
