export interface ITokenSecretService {
	generateSecret(): string;
	hash(tokenSecret: string): Uint8Array;
	verify(tokenSecret: string, hash: Uint8Array): boolean;
}
