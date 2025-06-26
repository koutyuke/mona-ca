import { type Err, type Result, err } from "@mona-ca/core/utils";
import { edenFetch } from "../../../shared/lib/eden-fetch";

type LogInResponse = {
	sessionToken: string;
};

type LogInError = Err<
	"INVALID_EMAIL_OR_PASSWORD" | "CAPTCHA_VERIFICATION_FAILED" | "TOO_MANY_REQUESTS" | "SERVER_ERROR" | "UNKNOWN_ERROR",
	{
		errorMessage: string;
	}
>;

type LogInResult = Result<LogInResponse, LogInError>;

export const logIn = async (email: string, password: string, turnstileToken: string): Promise<LogInResult> => {
	const res = await edenFetch.auth.login.post(
		{
			email,
			password,
			cfTurnstileResponse: turnstileToken,
		},
		{
			headers: {
				"mc-client-type": "mobile",
			},
		},
	);

	if (!res.error) {
		return {
			sessionToken: res.data.sessionToken,
		};
	}

	const { status, value } = res.error;

	if (status === 400) {
		if (value.code === "INVALID_EMAIL_OR_PASSWORD") {
			return err("INVALID_EMAIL_OR_PASSWORD", { errorMessage: "メールアドレスまたはパスワードが間違っています" });
		}
		if (value.code === "CAPTCHA_VERIFICATION_FAILED") {
			return err("CAPTCHA_VERIFICATION_FAILED", { errorMessage: "CAPTCHA認証に失敗しました" });
		}
	}

	if (status === 429) {
		return err("TOO_MANY_REQUESTS", { errorMessage: "リクエストが多すぎます" });
	}

	if (status === 500) {
		return err("SERVER_ERROR", { errorMessage: "サーバーエラーが発生しました" });
	}

	return err("UNKNOWN_ERROR", { errorMessage: "不明なエラーが発生しました" });
};
