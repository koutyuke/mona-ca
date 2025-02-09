import type { OAuth2Tokens } from "arctic";

export type AccountInfo = {
	id: string;
	email: string;
	name: string;
	iconUrl: string | null;
	emailVerified: boolean;
};

export interface IOAuthProviderGateway {
	genAuthUrl(state: string, codeVerifier: string): URL;
	getTokens(code: string, codeVerifier: string): Promise<OAuth2Tokens>;
	getAccountInfo(accessToken: string): Promise<AccountInfo | null>;
	revokeToken(token: string): Promise<void>;
}
