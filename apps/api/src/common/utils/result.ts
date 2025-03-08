const IS_ERR = Symbol("isErr");

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Result<T, E extends Err<string, any>> = T | E;

type Err<E extends string, D = never> = { [IS_ERR]: true; code: E; value: D };

const err = <E extends string, D = never>(code: E, value?: D): Err<E, D> => ({
	[IS_ERR]: true,
	code,
	value: value as D,
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const isErr = <T, E extends Err<string, any>>(result: Result<T, E>): result is E => (result as E)[IS_ERR] === true;

export { type Result, type Err, err, isErr };
