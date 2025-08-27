import type { Err } from "@mona-ca/core/utils";

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
	return new FetchError(err.code, err.value.errorMessage);
};

export type ResultToFetchError<R> = FetchError<Extract<R, Err<string, { errorMessage: string }>>["code"]>;

export type QueryAtomError<T extends FetchError<string>> = T | Error;
