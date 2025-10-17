export interface ISessionSecretHasher {
	generate(): string;
	hash(sessionSecret: string): Uint8Array;
	verify(sessionSecret: string, hash: Uint8Array): boolean;
}
