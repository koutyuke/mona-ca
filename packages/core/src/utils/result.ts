const IS_ERR = Symbol("isErr");

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Result<T extends Ok<any>, E extends Err<string, any>> = T | E;

export type Ok<T> = { [IS_ERR]: false; value: T };

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type Err<E extends string, D = {}> = { [IS_ERR]: true; code: E; value: D };

export const ok = <T>(value: T): Ok<T> => ({ [IS_ERR]: false, value });

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const err = <E extends string, D = {}>(code: E, value: D = {} as D): Err<E, D> => ({
	[IS_ERR]: true,
	code,
	value,
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isOk = <T extends Ok<any>, E extends Err<string, any>>(result: Result<T, E>): result is T =>
	typeof result === "object" && result !== null && (result as T)[IS_ERR] === false;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isErr = <T extends Ok<any>, E extends Err<string, any>>(result: Result<T, E>): result is E =>
	typeof result === "object" && result !== null && (result as E)[IS_ERR] === true;
