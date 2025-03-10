import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession, User } from "../../../../domain/entities";

export type EmailVerificationRequestUseCaseSuccessResult = {
	emailVerificationSessionToken: string;
	emailVerificationSession: EmailVerificationSession;
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
