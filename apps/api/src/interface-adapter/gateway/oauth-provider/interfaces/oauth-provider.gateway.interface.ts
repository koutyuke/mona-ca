import type { OAuth2Tokens } from "arctic";
import type { Err, Result } from "../../../../common/utils";

export type AccountInfo = {
	id: string;
	email: string;
	name: string;
	iconURL: string | null;
	emailVerified: boolean;
};

export type GetTokensResult = Result<
	OAuth2Tokens,
	Err<"FAILED_TO_FETCH_OAUTH_TOKENS"> | Err<"OAUTH_CREDENTIALS_INVALID">
>;

export type GetAccountInfoResult = Result<
	AccountInfo,
	Err<"FAILED_TO_GET_ACCOUNT_INFO"> | Err<"OAUTH_ACCESS_TOKEN_INVALID"> | Err<"OAUTH_ACCOUNT_EMAIL_NOT_FOUND">
>;

export interface IOAuthProviderGateway {
	genAuthURL(state: string, codeVerifier: string): URL;
	getTokens(code: string, codeVerifier: string): Promise<GetTokensResult>;
	getAccountInfo(accessToken: string): Promise<GetAccountInfoResult>;
	revokeToken(token: string): Promise<void>;
}
