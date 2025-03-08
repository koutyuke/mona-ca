import type { Err, Result } from "../../../../common/utils";
import type { EmailVerification, User } from "../../../../domain/entities";

export type EmailVerificationRequestUseCaseSuccessResult = EmailVerification;

export type EmailVerificationRequestUseCaseErrorResult =
	| Err<"EMAIL_IS_ALREADY_VERIFIED">
	| Err<"EMAIL_IS_ALREADY_USED">;

export type EmailVerificationRequestUseCaseResult = Result<
	EmailVerificationRequestUseCaseSuccessResult,
	EmailVerificationRequestUseCaseErrorResult
>;

export interface IEmailVerificationRequestUseCase {
	execute(email: string, user: User): Promise<EmailVerificationRequestUseCaseResult>;
}
