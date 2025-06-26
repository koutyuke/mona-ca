import { type Err, type Result, err } from "@mona-ca/core/utils";
import { edenFetch, withBearer } from "../../../shared/lib";
import type { UserDto } from "../model/user";

type GetMeResponse = UserDto;

type GetMeError = Err<
	"EXPIRED_SESSION" | "SESSION_OR_USER_NOT_FOUND" | "SERVER_ERROR" | "UNKNOWN_ERROR",
	{ errorMessage: string }
>;

export const getMe = async (sessionToken: string): Promise<Result<GetMeResponse, GetMeError>> => {
	const res = await edenFetch.users["@me"].index.get({
		headers: {
			authorization: withBearer(sessionToken),
			"mc-client-type": "mobile",
		},
	});

	if (!res.error) {
		return {
			...res.data,
		};
	}

	const { status, value } = res.error;

	if (status === 401) {
		if (value.code === "EXPIRED_SESSION") {
			return err("EXPIRED_SESSION", { errorMessage: "セッションが期限切れです" });
		}

		if (value.code === "SESSION_OR_USER_NOT_FOUND") {
			return err("SESSION_OR_USER_NOT_FOUND", { errorMessage: "セッションまたはユーザーが見つかりません" });
		}
	}

	if (status === 500) {
		return err("SERVER_ERROR", { errorMessage: "サーバーエラーが発生しました" });
	}

	return err("UNKNOWN_ERROR", { errorMessage: "不明なエラーが発生しました" });
};
