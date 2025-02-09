export interface ISessionTokenService {
	generateSessionToken(): string;
	hashSessionToken(token: string): string;
}
