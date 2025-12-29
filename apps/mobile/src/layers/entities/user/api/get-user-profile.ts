import { AUTHORIZATION_HEADER_NAME } from "@mona-ca/core/http";
import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/result";
import { treatyFetch, withBearer } from "../../../shared/api";
import { dtoToUser } from "../lib/converter";
import type { User } from "../model/user";

type Success = Ok<User>;

type Error = Err<
	"UNAUTHORIZED" | "SERVER_ERROR" | "VALIDATION_ERROR" | "NETWORK_ERROR" | "UNKNOWN_ERROR",
	{ errorMessage: string }
>;

export const getUserProfile = async (sessionToken: string): Promise<Result<Success, Error>> => {
	let res: Awaited<ReturnType<typeof treatyFetch.users.me.get>>;
	try {
		res = await treatyFetch.users.me.get({
			headers: {
				[AUTHORIZATION_HEADER_NAME]: withBearer(sessionToken),
			},
		});
	} catch (error) {
		return err("NETWORK_ERROR", { errorMessage: "Communication failed" });
	}

	if (!res.error) {
		return ok(dtoToUser(res.data));
	}

	const { value, status } = res.error;

	if (status === 422) {
		return err("VALIDATION_ERROR", {
			errorMessage: value.message ?? "There is an error in your input. Please check again.",
		});
	}

	if (status >= 500) {
		return err("SERVER_ERROR", {
			errorMessage: value.message ?? "A server error occurred. Please try again later.",
		});
	}

	if (value.code === "UNAUTHORIZED") {
		return err("UNAUTHORIZED", { errorMessage: value.message });
	}

	return err("UNKNOWN_ERROR", { errorMessage: value.message ?? "An error occurred. Please try again later." });
};
