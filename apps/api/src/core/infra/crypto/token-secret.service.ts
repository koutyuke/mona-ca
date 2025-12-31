import { timingSafeEqual } from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

import type { ITokenSecretService } from "../../ports/system";

export class TokenSecretService implements ITokenSecretService {
	generateSecret(): string {
		const bytes = new Uint8Array(32);
		crypto.getRandomValues(bytes);
		const secret = encodeBase32LowerCaseNoPadding(bytes);
		return secret;
	}

	hash(secret: string): Uint8Array {
		return sha256(new TextEncoder().encode(secret));
	}

	verify(secret: string, hash: Uint8Array): boolean {
		const hashed = this.hash(secret);
		if (hashed.byteLength !== hash.byteLength) {
			return false;
		}
		return timingSafeEqual(hashed, hash);
	}
}
