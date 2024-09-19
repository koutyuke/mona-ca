import type { EmailVerificationCode } from "@/domain/email-verification-code";

export interface IEmailVerificationCodeRepository {
	findByUserId(userId: EmailVerificationCode["userId"]): Promise<EmailVerificationCode | null>;
	create(emailVerificationCode: ConstructorParameters<typeof EmailVerificationCode>[0]): Promise<EmailVerificationCode>;
	delete(conditions?: {
		email?: EmailVerificationCode["email"];
		userId?: EmailVerificationCode["userId"];
	}): Promise<void>;
	deleteExpiredCodes(): Promise<void>;
}
