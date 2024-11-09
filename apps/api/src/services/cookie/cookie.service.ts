import { Value } from "@sinclair/typebox/value";
import type { Cookie, Static, TSchema } from "elysia";
import type { ICookieService, RemoveIndexSignature } from "./interfaces/cookie.service.interface";
import type { CookieAttributes } from "./interfaces/cookie.type";

export class CookieService<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	C extends Record<string, Cookie<any>>,
	S extends Record<keyof RemoveIndexSignature<C>, TSchema>,
> implements ICookieService<C, S>
{
	private readonly baseCookieAttributes: CookieAttributes;

	constructor(
		production: boolean,
		private readonly cookie: C,
		private readonly cookieSchema: S,
	) {
		this.baseCookieAttributes = {
			secure: production,
			domain: production ? "mona-ca.com" : "localhost",
			sameSite: "lax",
			httpOnly: true,
			path: "/",
		};
	}

	public setCookie<N extends keyof RemoveIndexSignature<C>>(
		name: N,
		value: Static<S[N]>,
		attributes?: CookieAttributes,
	): void {
		this.cookie[name]?.set({ ...this.baseCookieAttributes, ...attributes, value });
	}

	public getCookie<N extends keyof RemoveIndexSignature<C>>(name: N): Static<S[N]> {
		const value = this.cookie[name]!.value;
		const schema = this.cookieSchema[name];

		const result = Value.Convert(schema, value) as Static<typeof schema>;
		return result;
	}

	public deleteCookie(
		name: keyof RemoveIndexSignature<C>,
		attributes?: Omit<CookieAttributes, "maxAge" | "expires">,
	): void {
		this.cookie[name]?.set({
			...this.baseCookieAttributes,
			...attributes,
			value: "",
			expires: new Date(0),
			maxAge: 0,
		});
	}
}
