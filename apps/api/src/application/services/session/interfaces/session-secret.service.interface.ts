export interface ISessionSecretService {
	generateSessionSecret(): string;
	hashSessionSecret(secret: string): Uint8Array;
	verifySessionSecret(secret: string, hash: Uint8Array): boolean;
}
