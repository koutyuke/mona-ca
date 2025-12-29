import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/result";
import { treatyFetch } from "../../../shared/api";

type Success = Ok;

type Error = Err<
	| "INVALID_SIGNUP_SESSION"
	| "INVALID_CODE"
	| "ALREADY_VERIFIED"
	| "VALIDATION_ERROR"
	| "TOO_MANY_REQUESTS"
	| "NETWORK_ERROR"
	| "SERVER_ERROR"
	| "UNKNOWN_ERROR",
	{
		errorMessage: string;
	}
>;

export const signupVerify = async (signupToken: string, code: string): Promise<Result<Success, Error>> => {
	let res: Awaited<ReturnType<typeof treatyFetch.auth.signup.verify.post>>;
	try {
		res = await treatyFetch.auth.signup.verify.post({
			signupToken,
			code,
		});
	} catch (error) {
		return err("NETWORK_ERROR", { errorMessage: "Communication failed" });
	}

	if (!res.error) {
		return ok();
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
	if (value.code === "INVALID_CODE") {
		return err("INVALID_CODE", { errorMessage: value.message });
	}
	if (value.code === "ALREADY_VERIFIED") {
		return err("ALREADY_VERIFIED", { errorMessage: value.message });
	}

	return err("UNKNOWN_ERROR", { errorMessage: "An error occurred. Please try again later." });
};
