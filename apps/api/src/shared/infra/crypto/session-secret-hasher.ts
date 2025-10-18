import { timingSafeEqual } from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import type { ISessionSecretHasher } from "../../ports/system";

export class SessionSecretHasher implements ISessionSecretHasher {
	generate(): string {
		const bytes = new Uint8Array(32);
		crypto.getRandomValues(bytes);
		const token = encodeBase32LowerCaseNoPadding(bytes);
		return token;
	}

	hash(sessionSecret: string): Uint8Array {
		return sha256(new TextEncoder().encode(sessionSecret));
	}

	verify(sessionSecret: string, hash: Uint8Array): boolean {
		const hashed = this.hash(sessionSecret);
		if (hashed.byteLength !== hash.byteLength) {
			return false;
		}
		return timingSafeEqual(hashed, hash);
	}
}
