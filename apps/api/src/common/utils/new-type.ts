declare const __newType: unique symbol;

export type NewType<Constructor extends string, Type> = Type & {
	readonly [__newType]: Constructor;
};

export type ToPrimitive<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	T extends NewType<string, any>,
	S = T extends infer _ & {
		readonly [__newType]: infer U;
	}
		? U
		: never,
> = T extends infer U & {
	readonly [__newType]: S;
}
	? U
	: never;
