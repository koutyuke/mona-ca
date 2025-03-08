import { timingSafeEqual } from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import type { ISessionTokenService } from "./interfaces/session-token.service.interface";

export class SessionTokenService implements ISessionTokenService {
	constructor(private readonly pepper: string) {}

	public generateSessionToken(): string {
		const bytes = new Uint8Array(32);
		crypto.getRandomValues(bytes);
		const token = encodeBase32LowerCaseNoPadding(bytes);
		return token;
	}

	public hashSessionToken(token: string): string {
		return encodeHexLowerCase(sha256(new TextEncoder().encode(token + this.pepper)));
	}

	public verifySessionToken(token: string, hash: string): boolean {
		const tokenHash = new TextEncoder().encode(this.hashSessionToken(token));
		const hashBytes = new TextEncoder().encode(hash);
		return timingSafeEqual(tokenHash, hashBytes);
	}
}
