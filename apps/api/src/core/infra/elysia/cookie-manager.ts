import type { Cookie } from "elysia";
import { PRODUCTION_BASE_DOMAIN } from "../../lib/http";

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

export class CookieManager<C extends CookieObject, E extends ExtractPureCookieType<RemoveIndexSignature<C>>> {
	private readonly baseCookieAttributes: CookieAttributes = {
		secure: false,
		domain: "localhost",
		sameSite: "lax",
		httpOnly: true,
		path: "/",
	};

	constructor(
		production: boolean,
		private readonly cookie: C,
	) {
		if (production) {
			this.baseCookieAttributes.domain = `.${PRODUCTION_BASE_DOMAIN}`;
			this.baseCookieAttributes.secure = true;
		}
	}

	public setCookie<N extends keyof E>(name: N, value: E[N], attributes?: CookieAttributes): void {
		this.cookie[name]?.set({ ...this.baseCookieAttributes, ...attributes, value });
	}

	public getCookie<N extends keyof E>(name: N): E[N] {
		return this.cookie[name as keyof C]!.value as unknown as E[N];
	}

	public deleteCookie<N extends keyof E>(name: N, attributes?: Omit<CookieAttributes, "maxAge" | "expires">): void {
		this.cookie[name]?.set({
			...this.baseCookieAttributes,
			...attributes,
			value: "",
			expires: new Date(0),
			maxAge: 0,
		});
	}
}
