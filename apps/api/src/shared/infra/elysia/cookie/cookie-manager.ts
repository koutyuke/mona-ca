import { PRODUCTION_BASE_DOMAIN } from "../../../lib/http";
import type { CookieAttributes, CookieObject, ExtractPureCookieType, RemoveIndexSignature } from "./types";

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
