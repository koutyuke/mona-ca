import { timingSafeEqual } from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { type SessionId, newSessionId } from "../../../domain/value-object";
import type { ISessionTokenService } from "./interfaces/session-token.service.interface";

export class SessionTokenService implements ISessionTokenService {
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

	public separateTokenToIdAndSecret(token: string): { id: SessionId; secret: string } | null {
		const [id, secret] = token.split(".");
		if (!id || !secret) {
			return null;
		}
		return { id: newSessionId(id), secret };
	}

	public createToken(id: SessionId, secret: string): string {
		return `${id}.${secret}`;
	}
}
