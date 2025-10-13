import type { OAuth2Tokens } from "arctic";
import type { Err, Result } from "../../../../common/utils";

export type Identity = {
	id: string;
	email: string;
	name: string;
	iconURL: string | null;
	emailVerified: boolean;
};

export type GetTokensResult = Result<OAuth2Tokens, Err<"FETCH_TOKENS_FAILED"> | Err<"CREDENTIALS_INVALID">>;

export type GetIdentityResult = Result<
	Identity,
	Err<"FETCH_IDENTITY_FAILED"> | Err<"ACCESS_TOKEN_INVALID"> | Err<"IDENTITY_INVALID">
>;

export interface IOAuthProviderGateway {
	createAuthorizationURL(state: string, codeVerifier: string): URL;
	exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GetTokensResult>;
	getIdentity(tokens: GetTokensResult): Promise<GetIdentityResult>;
	revokeToken(tokens: OAuth2Tokens): Promise<void>;
}
