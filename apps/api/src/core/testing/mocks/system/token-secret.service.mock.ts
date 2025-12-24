import { timingSafeEqual } from "node:crypto";
import type { ITokenSecretService } from "../../../ports/system";

export class TokenSecretServiceMock implements ITokenSecretService {
	generateSecret(): string {
		return "token-secret";
	}

	hash(secret: string): Uint8Array {
		return new TextEncoder().encode(`__token-secret-hashed:${secret}`);
	}

	verify(secret: string, hash: Uint8Array): boolean {
		const expected = this.hash(secret);
		return expected.byteLength === hash.byteLength && timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
	}
}
