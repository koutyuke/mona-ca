import { DEFAULT_EMAIL_ADDRESS } from "@mona-ca/core/email";
import type { EmailContext } from "./type";

export const verificationEmailTemplate = (email: string, code: string): EmailContext => {
	const from = DEFAULT_EMAIL_ADDRESS;
	const to = email;
	const subject = `メールアドレス検証コードは 「${code}」 です。`;
	const text = `メールアドレスが正しく登録されていることを確認するため、以下のコードを入力してください。

コード：${code}

このコードは10分間有効です。誰とも共有しないでください。
あなたがこのコードを要求していない場合は、このメールを無視してください。`;
	const html = undefined;
	return { from, to, subject, text, html };
};
