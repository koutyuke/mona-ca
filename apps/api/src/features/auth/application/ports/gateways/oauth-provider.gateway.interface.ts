import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { OAuth2Tokens } from "arctic";

export type Identity = {
	id: string;
	email: string;
	name: string;
	iconURL: string | null;
	emailVerified: boolean;
};

export type GetTokensResult = Result<Ok<OAuth2Tokens>, Err<"FETCH_TOKENS_FAILED"> | Err<"CREDENTIALS_INVALID">>;

export type GetIdentityResult = Result<
	Ok<Identity>,
	Err<"FETCH_IDENTITY_FAILED"> | Err<"ACCESS_TOKEN_INVALID"> | Err<"IDENTITY_INVALID">
>;

export interface IOAuthProviderGateway {
	createAuthorizationURL(state: string, codeVerifier: string): URL;
	exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GetTokensResult>;
	getIdentity(tokens: OAuth2Tokens): Promise<GetIdentityResult>;
	revokeToken(tokens: OAuth2Tokens): Promise<void>;
}
