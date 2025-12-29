import { AUTHORIZATION_HEADER_NAME } from "@mona-ca/core/http";
import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/result";
import { treatyFetch, withBearer } from "../../../shared/api";
import { dtoToUser } from "../lib/converter";
import type { UpdateUserDto, User } from "../model/user";

type Success = Ok<User>;
type Error = Err<
	| "UNAUTHORIZED"
	| "SERVER_ERROR"
	| "UNKNOWN_ERROR"
	| "VALIDATION_ERROR"
	| "NETWORK_ERROR"
	| "REQUIRED_EMAIL_VERIFICATION",
	{ errorMessage: string }
>;

export const updateUserProfile = async (sessionToken: string, body: UpdateUserDto): Promise<Result<Success, Error>> => {
	let res: Awaited<ReturnType<typeof treatyFetch.users.me.patch>>;
	try {
		res = await treatyFetch.users.me.patch(body, {
			headers: {
				[AUTHORIZATION_HEADER_NAME]: withBearer(sessionToken),
			},
		});
	} catch (error) {
		return err("NETWORK_ERROR", { errorMessage: "Communication failed" });
	}

	if (!res.error) return ok(dtoToUser(res.data));

	const { value, status } = res.error;

	if (status === 422) {
		return err("VALIDATION_ERROR", {
			errorMessage: value.message ?? "There is an error in your input. Please check again.",
		});
	}
	if (status >= 500) {
		return err("SERVER_ERROR", {
			errorMessage: "A server error occurred. Please try again later.",
		});
	}

	if (value.code === "UNAUTHORIZED") {
		return err("UNAUTHORIZED", { errorMessage: value.message });
	}

	if (value.code === "REQUIRED_EMAIL_VERIFICATION") {
		return err("REQUIRED_EMAIL_VERIFICATION", { errorMessage: value.message });
	}

	return err("UNKNOWN_ERROR", { errorMessage: "An error occurred. Please try again later." });
};
