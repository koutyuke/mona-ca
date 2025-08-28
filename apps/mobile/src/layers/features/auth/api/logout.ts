import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/utils";
import { edenFetch, withBearer } from "../../../shared/api";

type Success = Ok<void>;

type Error = Err<
	| "INVALID_CLIENT_TYPE"
	| "EXPIRED_SESSION"
	| "INVALID_SESSION"
	| "EMAIL_VERIFICATION_REQUIRED"
	| "SERVER_ERROR"
	| "UNKNOWN_ERROR",
	{
		errorMessage: string;
	}
>;

export const logout = async (sessionToken: string): Promise<Result<Success, Error>> => {
	const res = await edenFetch.auth.logout.post(
		{},
		{
			headers: {
				authorization: withBearer(sessionToken),
				"mc-client-type": "mobile",
			},
		},
	);

	if (!res.error) {
		return ok(undefined);
	}

	const { status, value } = res.error;

	if (status === 400) {
		if (value.code === "INVALID_CLIENT_TYPE") {
			return err("INVALID_CLIENT_TYPE", { errorMessage: "クライアントタイプが無効です" });
		}
	}

	if (status === 401) {
		if (value.code === "EXPIRED_SESSION") {
			return err("EXPIRED_SESSION", { errorMessage: "セッションが期限切れです" });
		}
		if (value.code === "INVALID_SESSION") {
			return err("INVALID_SESSION", { errorMessage: "セッションが無効です" });
		}
		if (value.code === "EMAIL_VERIFICATION_REQUIRED") {
			return err("EMAIL_VERIFICATION_REQUIRED", { errorMessage: "メール認証が必要です" });
		}
	}

	if (status === 500) {
		return err("SERVER_ERROR", { errorMessage: "サーバーエラーが発生しました" });
	}

	return err("UNKNOWN_ERROR", { errorMessage: "エラーが発生しました" });
};
