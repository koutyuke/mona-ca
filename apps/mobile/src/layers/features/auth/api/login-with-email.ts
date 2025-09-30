import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/utils";
import { edenFetch } from "../../../shared/api";

type Success = Ok<{
	sessionToken: string;
}>;

type Error = Err<
	"INVALID_CREDENTIALS" | "CAPTCHA_VERIFICATION_FAILED" | "TOO_MANY_REQUESTS" | "SERVER_ERROR" | "UNKNOWN_ERROR",
	{
		errorMessage: string;
	}
>;

export const login = async (
	email: string,
	password: string,
	turnstileToken: string,
): Promise<Result<Success, Error>> => {
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
		return ok({
			sessionToken: res.data.sessionToken,
		});
	}

	const { status, value } = res.error;

	if (status === 400) {
		if (value.code === "INVALID_CREDENTIALS") {
			return err("INVALID_CREDENTIALS", { errorMessage: "メールアドレスまたはパスワードが間違っています" });
		}
		if (value.code === "CAPTCHA_VERIFICATION_FAILED") {
			return err("CAPTCHA_VERIFICATION_FAILED", { errorMessage: "CAPTCHA認証に失敗しました" });
		}
	}

	if (status === 429) {
		return err("TOO_MANY_REQUESTS", {
			errorMessage: "リクエストが多すぎます。時間をおいて再度お試しください",
		});
	}

	if (status === 500) {
		return err("SERVER_ERROR", { errorMessage: "サーバーエラーが発生しました" });
	}

	return err("UNKNOWN_ERROR", { errorMessage: "エラーが発生しました" });
};
