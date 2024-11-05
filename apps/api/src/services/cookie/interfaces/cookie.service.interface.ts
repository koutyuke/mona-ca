import type { Cookie, Static, TSchema } from "elysia";
import type { CookieAttributes } from "./cookie.type";

export type RemoveIndexSignature<T> = {
	[K in keyof T as K extends string ? (string extends K ? never : K) : never]: T[K];
};

export interface ICookieService<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	C extends Record<string, Cookie<any>>,
	S extends Record<keyof RemoveIndexSignature<C>, TSchema>,
> {
	setCookie<N extends keyof RemoveIndexSignature<C>>(name: N, value: Static<S[N]>, attributes?: CookieAttributes): void;
	getCookie<N extends keyof RemoveIndexSignature<C>>(name: N): Static<S[N]>;
	deleteCookie(name: keyof RemoveIndexSignature<C>, attributes?: Omit<CookieAttributes, "maxAge" | "expires">): void;
}
