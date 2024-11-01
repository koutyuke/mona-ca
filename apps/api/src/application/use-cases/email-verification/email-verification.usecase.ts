import { generateRandomString } from "@/common/utils/generate-random-value";
import { TimeSpan } from "@/common/utils/time-span";
import type { EmailVerificationCode } from "@/domain/email-verification-code";
import type { IEmailVerificationCodeRepository } from "@/interface-adapter/repositories/email-verification-code";
import { MC_DEFAULT_EMAIL_ADDRESS } from "@mona-ca/core/const";
import { ulid } from "ulid";
import type { IEmailVerificationUseCase } from "./interface/email-verification.usecase.interface";

export class EmailVerificationUseCase implements IEmailVerificationUseCase {
	constructor(private emailVerificationCodeRepository: IEmailVerificationCodeRepository) {}

	public async getVerificationCode(userId: EmailVerificationCode["userId"]): Promise<EmailVerificationCode | null> {
		return this.emailVerificationCodeRepository.findByUserId(userId);
	}

	public async createVerificationCode(
		email: EmailVerificationCode["email"],
		userId: EmailVerificationCode["userId"],
	): Promise<EmailVerificationCode> {
		await this.emailVerificationCodeRepository.delete({ userId });
		return this.emailVerificationCodeRepository.create({
			id: ulid(),
			email,
			userId,
			code: this.generateCode(),
			expiresAt: this.genExpiresAt(),
		});
	}

	public async deleteVerificationCode(userId: EmailVerificationCode["userId"]): Promise<void> {
		this.emailVerificationCodeRepository.delete({ userId });
	}

	public async deleteManyVerificationCodesByEmail(email: EmailVerificationCode["email"]): Promise<void> {
		this.emailVerificationCodeRepository.delete({ email });
	}

	public async deleteAllExpiredVerificationCodes(): Promise<void> {
		this.emailVerificationCodeRepository.deleteExpiredCodes();
	}

	public async validateVerificationCode(
		code: EmailVerificationCode["code"],
		email: EmailVerificationCode["email"],
		userId: EmailVerificationCode["userId"],
	): Promise<boolean> {
		const databaseCode = await this.emailVerificationCodeRepository.findByUserId(userId);

		if (!databaseCode || databaseCode.code !== code) {
			return false;
		}

		await this.emailVerificationCodeRepository.delete({ userId });

		if (databaseCode.isExpired || databaseCode.email !== email) {
			return false;
		}

		return true;
	}

	public generateVerificationEmailContents(code: EmailVerificationCode): {
		from: string;
		to: string;
		subject: string;
		text: string;
		html: string | undefined;
	} {
		const from = MC_DEFAULT_EMAIL_ADDRESS;
		const to = code.email;
		const subject = `メールアドレス検証コードは ${code.code} です。`;
		const text = `メールアドレスが正しく登録されていることを確認するため、以下のコードを入力してください。

コード：${code.code}

このコードは15分間有効です。誰とも共有しないでください。
このコードを要求していない場合は、このメールを無視してください。`;
		const html = undefined;
		return { from, to, subject, text, html };
	}

	private generateCode(): string {
		return generateRandomString(8);
	}

	private genExpiresAt(): Date {
		const timeSpan = new TimeSpan(15, "m");
		return new Date(Date.now() + timeSpan.milliseconds());
	}
}
