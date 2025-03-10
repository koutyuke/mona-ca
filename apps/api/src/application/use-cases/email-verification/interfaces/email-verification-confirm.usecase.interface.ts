import type { Err, Result } from "../../../../common/utils";
import type { User } from "../../../../domain/entities";

export type EmailVerificationConfirmUseCaseErrorResult =
	| Err<"INVALID_CODE">
	| Err<"CODE_WAS_EXPIRED">
	| Err<"NOT_REQUEST">
	| Err<"INVALID_EMAIL">;

export type EmailVerificationConfirmUseCaseResult = Result<void, EmailVerificationConfirmUseCaseErrorResult>;
export interface IEmailVerificationConfirmUseCase {
	execute(
		emailVerificationSessionToken: string,
		code: string,
		user: User,
	): Promise<EmailVerificationConfirmUseCaseResult>;
}
