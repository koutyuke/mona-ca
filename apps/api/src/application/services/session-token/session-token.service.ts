import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import type { ISessionTokenService } from "./interfaces/session-token.service.interface";

export class SessionTokenService implements ISessionTokenService {
	private readonly pepper: string;

	constructor(pepper: string) {
		this.pepper = pepper;
	}

	public generateSessionToken(): string {
		const bytes = new Uint8Array(24);
		crypto.getRandomValues(bytes);
		const token = encodeBase32LowerCaseNoPadding(bytes);
		return token;
	}

	public hashSessionToken(token: string): string {
		return encodeHexLowerCase(sha256(new TextEncoder().encode(token + this.pepper)));
	}
}
