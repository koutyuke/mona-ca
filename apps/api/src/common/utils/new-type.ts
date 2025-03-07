declare const __newType: unique symbol;

export type NewType<Constructor extends string, Type> = Type & {
	readonly [__newType]: Constructor;
};
