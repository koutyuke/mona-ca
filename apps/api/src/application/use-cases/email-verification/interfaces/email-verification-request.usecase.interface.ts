import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationCode } from "../../../../domain/entities/email-verification-code";
import type { User } from "../../../../domain/entities/user";

export type EmailVerificationRequestUseCaseSuccessResult = {
	code: EmailVerificationCode;
};

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
