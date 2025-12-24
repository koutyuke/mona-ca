import type { IHmacService, MacOptions } from "../../../ports/system";

export class HmacServiceMock implements IHmacService {
	sign(plaintext: string, _opts?: MacOptions): string {
		return `__hmac:${plaintext}`;
	}

	verify(plaintext: string, mac: string, _opts?: MacOptions): boolean {
		const generatedMac = this.sign(plaintext, _opts);
		return generatedMac === mac;
	}
}
