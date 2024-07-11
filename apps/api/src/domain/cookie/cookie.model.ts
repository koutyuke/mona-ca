import { type CookieAttributes, Cookie as LuciaCookie } from "lucia";

// Reference: https://github.com/pilcrowOnPaper/oslo/blob/main/src/cookie/index.ts
export class Cookie extends LuciaCookie {
	constructor({ name, value, attributes }: { name: string; value: string; attributes: CookieAttributes }) {
		super(name, value, attributes);
	}
}
