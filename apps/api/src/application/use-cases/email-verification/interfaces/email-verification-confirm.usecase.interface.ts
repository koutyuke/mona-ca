import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";

export type EmailVerificationConfirmUseCaseSuccessResult = {
	sessionToken: string;
	session: Session;
};

export type EmailVerificationConfirmUseCaseErrorResult =
	| Err<"INVALID_CODE">
	| Err<"CODE_WAS_EXPIRED">
	| Err<"NOT_REQUEST">
	| Err<"INVALID_EMAIL">;

export type EmailVerificationConfirmUseCaseResult = Result<
	EmailVerificationConfirmUseCaseSuccessResult,
	EmailVerificationConfirmUseCaseErrorResult
>;
export interface IEmailVerificationConfirmUseCase {
	execute(
		emailVerificationSessionToken: string,
		code: string,
		user: User,
	): Promise<EmailVerificationConfirmUseCaseResult>;
}
