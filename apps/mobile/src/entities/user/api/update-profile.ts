import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/utils";
import { edenFetch, withBearer } from "../../../shared/api";
import { dtoToUser } from "../lib/converter";
import type { UpdateUserDto, User } from "../model/user";

type Success = Ok<User>;
type Error = Err<
	"EXPIRED_SESSION" | "INVALID_SESSION" | "SERVER_ERROR" | "UNKNOWN_ERROR" | "VALIDATION_ERROR",
	{ errorMessage: string }
>;

export const updateProfile = async (sessionToken: string, body: UpdateUserDto): Promise<Result<Success, Error>> => {
	const res = await edenFetch.users["@me"].index.patch(body, {
		headers: {
			authorization: withBearer(sessionToken),
			"mc-client-type": "mobile",
		},
	});

	if (!res.error) return ok(dtoToUser(res.data));

	const { value } = res.error;

	if (value.code === "PARSE_ERROR" || value.code === "VALIDATION_ERROR" || value.code === "INVALID_COOKIE_SIGNATURE") {
		return err("VALIDATION_ERROR", { errorMessage: value.message });
	}
	if (value.code === "EXPIRED_SESSION") {
		return err("EXPIRED_SESSION", { errorMessage: value.message });
	}
	if (value.code === "INVALID_SESSION") {
		return err("INVALID_SESSION", { errorMessage: value.message });
	}
	if (value.code === "INTERNAL_SERVER_ERROR") {
		return err("SERVER_ERROR", { errorMessage: value.message });
	}
	console.error(res.error);
	return err("UNKNOWN_ERROR", { errorMessage: value.message });
};
