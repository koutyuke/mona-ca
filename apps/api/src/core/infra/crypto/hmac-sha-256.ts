import { createHmac } from "node:crypto";
import { timingSafeStringEqual } from "../../lib/security";
import type { IMac, MacEncoding, MacOptions } from "../../ports/system";

export class HmacSha256 implements IMac {
	private readonly secret: string;

	constructor(secret: string) {
		this.secret = secret;
	}

	private getEncoding(opts?: MacOptions): MacEncoding {
		return opts?.encoding ?? "hex";
	}

	sign(plaintext: string, opts?: MacOptions): string {
		const encoding = this.getEncoding(opts);
		const mac = createHmac("sha256", this.secret);
		mac.update(plaintext);
		return mac.digest(encoding);
	}

	verify(plaintext: string, mac: string, opts?: MacOptions): boolean {
		const generatedMac = this.sign(plaintext, opts);
		return timingSafeStringEqual(generatedMac, mac);
	}
}
