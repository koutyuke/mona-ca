export type CookieAttributes = {
	secure?: boolean;
	path?: string;
	domain?: string;
	sameSite?: "lax" | "strict" | "none";
	httpOnly?: boolean;
	maxAge?: number;
	expires?: Date;
};

export class Cookie {
	public readonly name: string;
	public readonly value: string;
	public readonly attributes: CookieAttributes;

	constructor(args: {
		name: string;
		value: string;
		attributes: CookieAttributes;
	}) {
		this.name = args.name;
		this.value = args.value;
		this.attributes = args.attributes;
	}
}
