import type { Err, Result } from "../../../../common/utils";
import type { EmailVerificationSession, User } from "../../../../domain/entities";
import type { EmailVerificationSessionToken } from "../../../../domain/value-object";

export type EmailVerificationRequestUseCaseSuccessResult = {
	emailVerificationSessionToken: EmailVerificationSessionToken;
	emailVerificationSession: EmailVerificationSession;
};

export type EmailVerificationRequestUseCaseErrorResult =
	| Err<"EMAIL_ALREADY_VERIFIED">
	| Err<"EMAIL_ALREADY_REGISTERED">;

export type EmailVerificationRequestUseCaseResult = Result<
	EmailVerificationRequestUseCaseSuccessResult,
	EmailVerificationRequestUseCaseErrorResult
>;

export interface IEmailVerificationRequestUseCase {
	execute(email: string, user: User): Promise<EmailVerificationRequestUseCaseResult>;
}
