const RESULT_TYPE = Symbol("ResultType");

export type Ok<T = never> = { [RESULT_TYPE]: "ok"; isErr: false; isOk: true; value: T };

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type Err<E extends string, D = {}> = { [RESULT_TYPE]: "err"; isErr: true; isOk: false; code: E; context: D };

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Result<T extends Ok<any>, E extends Err<string, any> = never> = T | E;

export function ok(): Ok<never>;
export function ok<T>(value: T): Ok<T>;
export function ok<T = never>(value?: T): Ok<T> {
	return { [RESULT_TYPE]: "ok", isErr: false, isOk: true, value: value as T };
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function err<E extends string, D = {}>(code: E, context: D = {} as D): Err<E, D> {
	return {
		[RESULT_TYPE]: "err",
		isErr: true,
		isOk: false,
		code,
		context,
	};
}
