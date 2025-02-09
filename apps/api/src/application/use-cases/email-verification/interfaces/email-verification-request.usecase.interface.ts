import type { EmailVerificationCode } from "../../../../models/entities/email-verification-code";
import type { User } from "../../../../models/entities/user";

export interface IEmailVerificationRequestUseCaseResult {
	code: EmailVerificationCode | null;
}

export interface IEmailVerificationRequestUseCase {
	execute(email: string, user: User): Promise<IEmailVerificationRequestUseCaseResult>;
}
