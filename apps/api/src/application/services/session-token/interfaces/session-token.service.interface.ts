import type { SessionId } from "../../../../domain/value-object";

export interface ISessionTokenService {
	generateSessionSecret(): string;
	hashSessionSecret(secret: string): Uint8Array;
	verifySessionSecret(secret: string, hash: Uint8Array): boolean;
	separateTokenToIdAndSecret(token: string): { id: SessionId; secret: string } | null;
	createToken(id: SessionId, secret: string): string;
}
