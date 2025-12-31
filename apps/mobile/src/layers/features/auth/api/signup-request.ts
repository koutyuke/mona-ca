import { err, ok } from "@mona-ca/core/result";
import { treatyFetch } from "../../../shared/api";

import type { Err, Ok, Result } from "@mona-ca/core/result";

type Success = Ok<{
	signupToken: string;
}>;

type Error = Err<
	| "EMAIL_ALREADY_USED"
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

export const signupRequest = async (email: string, turnstileToken: string): Promise<Result<Success, Error>> => {
	let res: Awaited<ReturnType<typeof treatyFetch.auth.signup.post>>;
	try {
		res = await treatyFetch.auth.signup.post({
			email,
			turnstileToken,
		});
	} catch (_error) {
		return err("NETWORK_ERROR", { errorMessage: "Communication failed" });
	}

	if (!res.error) {
		if (res.data === null) {
			return err("UNKNOWN_ERROR", { errorMessage: "Response data is null" });
		}
		return ok({
			signupToken: res.data.signupToken,
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

	if (value.code === "EMAIL_ALREADY_USED") {
		return err("EMAIL_ALREADY_USED", { errorMessage: value.message });
	}
	if (value.code === "CAPTCHA_FAILED") {
		return err("CAPTCHA_FAILED", { errorMessage: value.message });
	}

	return err("UNKNOWN_ERROR", { errorMessage: value.message ?? "An error occurred. Please try again later." });
};
