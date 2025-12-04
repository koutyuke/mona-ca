declare const __brand: unique symbol;

export type Brand<Name extends string, T> = {
	readonly [__brand]: Name;
} & T;

type BrandName<T> = T extends Brand<infer Name, unknown> ? Name : never;

export type Unbrand<T> = T extends Brand<BrandName<T>, infer R> ? R : never;
