import type { ITurnstileGateway, TurnstileResult } from "./interfaces/turnstile.gateway.interface";

export class TurnstileGateway implements ITurnstileGateway {
	constructor(private readonly secret: string) {}
	public async verify(token: string, ipAddress: string): Promise<TurnstileResult> {
		const formData = new FormData();

		formData.append("secret", this.secret);
		formData.append("response", token);
		formData.append("remoteip", ipAddress);
		formData.append("remoteip_leniency", "relaxed");

		const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			body: formData,
		});

		const result: TurnstileResult = await res.json();

		return result;
	}
}
