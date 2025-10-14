import { timingSafeEqual } from "node:crypto";
import type { ISessionSecretHasher } from "../../../application/ports/out/system";

export class SessionSecretHasherMock implements ISessionSecretHasher {
	generate(): string {
		return "session-secret-mock";
	}

	hash(sessionSecret: string): Uint8Array {
		return new TextEncoder().encode(`__session-secret-hashed:${sessionSecret}`);
	}

	verify(sessionSecret: string, hash: Uint8Array): boolean {
		const expected = this.hash(sessionSecret);
		return expected.byteLength === hash.byteLength && timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
	}
}
