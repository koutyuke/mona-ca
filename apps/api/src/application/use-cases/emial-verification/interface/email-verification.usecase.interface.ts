import type { EmailVerificationCode } from "@/domain/email-verification-code";

export interface IEmailVerificationUseCase {
	getVerificationCode(userId: EmailVerificationCode["userId"]): Promise<EmailVerificationCode | null>;
	createVerificationCode(
		email: EmailVerificationCode["email"],
		userId: EmailVerificationCode["userId"],
	): Promise<EmailVerificationCode>;
	deleteVerificationCode(userId: EmailVerificationCode["userId"]): Promise<void>;
	deleteManyVerificationCodesByEmail(email: EmailVerificationCode["email"]): Promise<void>;
	deleteAllExpiredVerificationCodes(): Promise<void>;
	validateVerificationCode(
		code: EmailVerificationCode["code"],
		email: EmailVerificationCode["email"],
		userId: EmailVerificationCode["userId"],
	): Promise<boolean>;
	generateVerificationEmailContents(code: EmailVerificationCode): {
		from: string;
		to: string;
		subject: string;
		text: string | undefined;
		html: string | undefined;
	};
}
