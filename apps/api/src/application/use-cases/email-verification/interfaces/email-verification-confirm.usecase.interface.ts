import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession, Session, User } from "../../../../domain/entities";

export type EmailVerificationConfirmUseCaseSuccessResult = {
	sessionToken: string;
	session: Session;
};

export type EmailVerificationConfirmUseCaseErrorResult =
	| Err<"INVALID_CODE">
	| Err<"EXPIRED_CODE">
	| Err<"INVALID_EMAIL">;

export type EmailVerificationConfirmUseCaseResult = Result<
	EmailVerificationConfirmUseCaseSuccessResult,
	EmailVerificationConfirmUseCaseErrorResult
>;
export interface IEmailVerificationConfirmUseCase {
	execute(
		code: string,
		user: User,
		emailVerificationSession: EmailVerificationSession,
	): Promise<EmailVerificationConfirmUseCaseResult>;
}
