import { MC_DEFAULT_EMAIL_ADDRESS } from "@mona-ca/core/const";
import type { EmailVerificationCode } from "../../../../domain/email-verification-code";
import type { EmailTemplate } from "./type";

export const verificationEmailTemplate = (code: EmailVerificationCode): EmailTemplate => {
	const from = MC_DEFAULT_EMAIL_ADDRESS;
	const to = code.email;
	const subject = `メールアドレス検証コードは ${code.code} です。`;
	const text = `メールアドレスが正しく登録されていることを確認するため、以下のコードを入力してください。

コード：${code.code}

このコードは15分間有効です。誰とも共有しないでください。
このコードを要求していない場合は、このメールを無視してください。`;
	const html = undefined;
	return { from, to, subject, text, html };
};
