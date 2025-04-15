import type { Cookie } from "elysia";

export type CookieAttributes = {
	secure?: boolean;
	path?: string;
	domain?: string;
	sameSite?: "lax" | "strict" | "none";
	httpOnly?: boolean;
	maxAge?: number;
	expires?: Date;
};

export type CookieObject = {
	[key: string]: Cookie<string | undefined>;
};

export type RemoveIndexSignature<T> = {
	[K in keyof T as K extends string ? (string extends K ? never : K) : never]: T[K];
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ExtractPureCookieType<C extends Record<string, Cookie<any>>> = {
	[K in keyof C as C[K] extends Cookie<infer T>
		? T extends string | undefined
			? K
			: never
		: never]: C[K] extends Cookie<infer T> ? T : never;
};
