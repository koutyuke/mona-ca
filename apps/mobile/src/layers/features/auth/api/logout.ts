import { err, ok } from "@mona-ca/core/result";
import { treatyFetch, withBearer } from "../../../shared/api";

import type { Err, Ok, Result } from "@mona-ca/core/result";

type Success = Ok;

type Error = Err<
	"UNAUTHORIZED" | "SERVER_ERROR" | "VALIDATION_ERROR" | "NETWORK_ERROR" | "UNKNOWN_ERROR",
	{
		errorMessage: string;
	}
>;

export const logout = async (sessionToken: string): Promise<Result<Success, Error>> => {
	let res: Awaited<ReturnType<typeof treatyFetch.auth.logout.post>>;
	try {
		res = await treatyFetch.auth.logout.post(
			{},
			{
				headers: {
					authorization: withBearer(sessionToken),
					"mc-client-type": "mobile",
				},
			},
		);
	} catch (_error) {
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
