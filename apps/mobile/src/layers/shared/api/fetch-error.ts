import type { Err } from "@mona-ca/core/result";

export class FetchError<E extends string> extends Error {
	constructor(
		public code: E,
		public errorMessage: string,
	) {
		super(errorMessage);
		this.name = "FetchError";
	}
}

export const ResultErrToFetchError = <E extends string>(err: Err<E, { errorMessage: string }>): FetchError<E> => {
	return new FetchError(err.code, err.context.errorMessage);
};
