import type { OAuth2Tokens } from "arctic";

export type AccountInfo = {
	id: string;
	email: string;
	name: string;
	iconUrl: string | null;
	emailVerified: boolean;
};

export interface IOAuthProviderService {
	genAuthUrl(state: string, codeVerifier: string): URL;
	getTokens(code: string, codeVerifier: string): Promise<OAuth2Tokens>;
	getAccountInfo(accessToken: string): Promise<AccountInfo | null>;
}
