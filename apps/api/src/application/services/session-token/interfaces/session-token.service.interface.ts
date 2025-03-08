export interface ISessionTokenService {
	generateSessionToken(): string;
	hashSessionToken(token: string): string;
	verifySessionToken(token: string, hash: string): boolean;
}
