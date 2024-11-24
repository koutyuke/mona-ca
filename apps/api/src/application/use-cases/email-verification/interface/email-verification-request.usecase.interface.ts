import type { EmailVerificationCode } from "../../../../domain/email-verification-code";
import type { User } from "../../../../domain/user";

export interface IEmailVerificationRequestUseCaseResult {
	code: EmailVerificationCode | null;
}

export interface IEmailVerificationRequestUseCase {
	execute(email: string, user: User): Promise<IEmailVerificationRequestUseCaseResult>;
}
