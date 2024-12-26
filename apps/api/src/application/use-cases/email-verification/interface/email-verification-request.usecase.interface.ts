import type { EmailVerificationCode } from "../../../../entities/email-verification-code";
import type { User } from "../../../../entities/user";

export interface IEmailVerificationRequestUseCaseResult {
	code: EmailVerificationCode | null;
}

export interface IEmailVerificationRequestUseCase {
	execute(email: string, user: User): Promise<IEmailVerificationRequestUseCaseResult>;
}
