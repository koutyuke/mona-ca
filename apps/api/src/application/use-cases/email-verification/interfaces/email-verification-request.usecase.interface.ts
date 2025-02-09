import type { EmailVerificationCode } from "../../../../domain/entities/email-verification-code";
import type { User } from "../../../../domain/entities/user";

export interface IEmailVerificationRequestUseCaseResult {
	code: EmailVerificationCode | null;
}

export interface IEmailVerificationRequestUseCase {
	execute(email: string, user: User): Promise<IEmailVerificationRequestUseCaseResult>;
}
