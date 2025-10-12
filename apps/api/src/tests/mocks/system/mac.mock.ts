import type { IMac, MacOptions } from "../../../application/ports/out/system";

export class MacMock implements IMac {
	sign(plaintext: string, _opts?: MacOptions): string {
		return `__mac:${plaintext}`;
	}

	verify(plaintext: string, mac: string, _opts?: MacOptions): boolean {
		const generatedMac = this.sign(plaintext, _opts);
		return generatedMac === mac;
	}
}
