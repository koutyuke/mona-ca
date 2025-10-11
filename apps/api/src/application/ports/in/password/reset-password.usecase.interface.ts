import type { Err, Result } from "../../../../common/utils";
import type { PasswordResetSession, User } from "../../../../domain/entities";

type Success = undefined;

type Error = Err<"REQUIRED_EMAIL_VERIFICATION">;

export type ResetPasswordUseCaseResult = Result<Success, Error>;

export interface IResetPasswordUseCase {
	execute(
		newPassword: string,
		passwordResetSession: PasswordResetSession,
		user: User,
	): Promise<ResetPasswordUseCaseResult>;
}
