import { timingSafeEqual } from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import type { ISessionSecretService } from "./interfaces/session-secret.service.interface";

export class SessionSecretService implements ISessionSecretService {
	constructor(private readonly pepper: string) {}

	public generateSessionSecret(): string {
		const bytes = new Uint8Array(32);
		crypto.getRandomValues(bytes);
		const token = encodeBase32LowerCaseNoPadding(bytes);
		return token;
	}

	public hashSessionSecret(secret: string): Uint8Array {
		return sha256(new TextEncoder().encode(secret + this.pepper));
	}

	public verifySessionSecret(secret: string, hash: Uint8Array): boolean {
		const tokenHash = this.hashSessionSecret(secret);
		return timingSafeEqual(tokenHash, hash);
	}
}
