const IS_ERR = Symbol("isErr");

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Result<T, E extends Err<string, any>> = T | E;

// biome-ignore lint/complexity/noBannedTypes: <explanation>
type Err<E extends string, D = {}> = { [IS_ERR]: true; code: E; value: D };

// biome-ignore lint/complexity/noBannedTypes: <explanation>
const err = <E extends string, D = {}>(code: E, value: D = {} as D): Err<E, D> => ({
	[IS_ERR]: true,
	code,
	value,
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const isErr = <T, E extends Err<string, any>>(result: Result<T, E>): result is E =>
	typeof result === "object" && result !== null && (result as E)[IS_ERR] === true;

export { type Result, type Err, err, isErr };
