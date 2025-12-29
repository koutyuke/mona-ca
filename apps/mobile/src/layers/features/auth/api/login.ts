import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/result";
import { treatyFetch } from "../../../shared/api";

type Success = Ok<{
	sessionToken: string;
}>;

type Error = Err<
	| "INVALID_CREDENTIALS"
	| "CAPTCHA_FAILED"
	| "TOO_MANY_REQUESTS"
	| "VALIDATION_ERROR"
	| "NETWORK_ERROR"
	| "SERVER_ERROR"
	| "UNKNOWN_ERROR",
	{
		errorMessage: string;
	}
>;

export const login = async (
	email: string,
	password: string,
	turnstileToken: string,
): Promise<Result<Success, Error>> => {
	let res: Awaited<ReturnType<typeof treatyFetch.auth.login.post>>;
	try {
		res = await treatyFetch.auth.login.post({
			email,
			password,
			turnstileToken,
		});
	} catch (error) {
		return err("NETWORK_ERROR", { errorMessage: "Communication failed" });
	}

	if (!res.error) {
		if (res.data === null) {
			return err("UNKNOWN_ERROR", { errorMessage: "An error occurred. Please try again later." });
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

	if (value.code === "INVALID_CREDENTIALS") {
		return err("INVALID_CREDENTIALS", { errorMessage: value.message });
	}
	if (value.code === "CAPTCHA_FAILED") {
		return err("CAPTCHA_FAILED", { errorMessage: value.message });
	}

	return err("UNKNOWN_ERROR", { errorMessage: value.message ?? "An error occurred. Please try again later." });
};
