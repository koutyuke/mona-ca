import type { ISessionSecretService } from "../../../application/services/session";

export class SessionSecretServiceMock implements ISessionSecretService {
	generateSessionSecret(): string {
		return Math.random().toString(36).substring(2, 15);
	}

	hashSessionSecret(secret: string): Uint8Array {
		return new TextEncoder().encode(secret);
	}

	verifySessionSecret(secret: string, hash: Uint8Array): boolean {
		const secretHash = this.hashSessionSecret(secret);
		if (secretHash.length !== hash.length) {
			return false;
		}
		return secretHash.every((value, index) => value === hash[index]);
	}
}
