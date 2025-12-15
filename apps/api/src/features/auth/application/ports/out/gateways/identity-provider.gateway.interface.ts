import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { OAuth2Tokens } from "arctic";
import type { IdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";

export type UserInfo = {
	id: IdentityProvidersUserId;
	email: string;
	name: string;
	iconURL: string | null;
	emailVerified: boolean;
};

export type GetTokensResult = Result<Ok<OAuth2Tokens>, Err<"FETCH_TOKENS_FAILED"> | Err<"CREDENTIALS_INVALID">>;

export type GetUserInfoResult = Result<
	Ok<{
		userInfo: UserInfo;
	}>,
	Err<"USER_INFO_GET_FAILED"> | Err<"INVALID_USER_INFO">
>;

export interface IIdentityProviderGateway {
	createAuthorizationURL(state: string, codeVerifier: string): URL;
	exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GetTokensResult>;
	getUserInfo(tokens: OAuth2Tokens): Promise<GetUserInfoResult>;
	revokeToken(tokens: OAuth2Tokens): Promise<void>;
}
