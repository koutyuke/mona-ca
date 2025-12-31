import { err, ok } from "@mona-ca/core/result";
import { treatyFetch } from "../../../shared/api";

import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { Gender } from "../../../entities/user";

type RegisterUserDto = {
	name: string;
	password: string;
	gender: Gender;
};

type Success = Ok<{
	sessionToken: string;
}>;

type Error = Err<
	| "INVALID_SIGNUP_SESSION"
	| "EMAIL_ALREADY_REGISTERED"
	| "REQUIRED_EMAIL_VERIFICATION"
	| "TOO_MANY_REQUESTS"
	| "VALIDATION_ERROR"
	| "NETWORK_ERROR"
	| "SERVER_ERROR"
	| "UNKNOWN_ERROR",
	{
		errorMessage: string;
	}
>;

export const signupRegister = async (signupToken: string, body: RegisterUserDto): Promise<Result<Success, Error>> => {
	let res: Awaited<ReturnType<typeof treatyFetch.auth.signup.register.post>>;
	try {
		res = await treatyFetch.auth.signup.register.post({
			signupToken,
			...body,
		});
	} catch (_error) {
		return err("NETWORK_ERROR", { errorMessage: "Communication failed" });
	}

	if (!res.error) {
		if (res.data === null) {
			return err("UNKNOWN_ERROR", { errorMessage: "Response data is null" });
		}
		return ok({
			sessionToken: res.data.sessionToken,
		});
	}

	const { status, value } = res.error;

	if (status === 422) {
		return err("VALIDATION_ERROR", {
			errorMessage: value.message ?? "There is an error in your input. Please check again.",
		});
	}

	if (status === 429) {
		return err("TOO_MANY_REQUESTS", {
			errorMessage: value.message,
		});
	}

	if (status >= 500) {
		return err("SERVER_ERROR", {
			errorMessage: value.message ?? "A server error occurred. Please try again later.",
		});
	}

	if (value.code === "INVALID_SIGNUP_SESSION") {
		return err("INVALID_SIGNUP_SESSION", { errorMessage: value.message });
	}

	if (value.code === "EMAIL_ALREADY_REGISTERED") {
		return err("EMAIL_ALREADY_REGISTERED", { errorMessage: value.message });
	}

	if (value.code === "REQUIRED_EMAIL_VERIFICATION") {
		return err("REQUIRED_EMAIL_VERIFICATION", { errorMessage: value.message });
	}

	return err("UNKNOWN_ERROR", { errorMessage: value.message ?? "An error occurred. Please try again later." });
};
