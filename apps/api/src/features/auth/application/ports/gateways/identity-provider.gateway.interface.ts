import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { OAuth2Tokens } from "arctic";
import type { IdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

export type ProviderUser = {
	id: IdentityProvidersUserId;
	email: string;
	name: string;
	iconURL: string | null;
	emailVerified: boolean;
};

export type GetTokensResult = Result<Ok<OAuth2Tokens>, Err<"FETCH_TOKENS_FAILED"> | Err<"CREDENTIALS_INVALID">>;

export type GetProviderUserResult = Result<
	Ok<{
		providerUser: ProviderUser;
	}>,
	Err<"GET_PROVIDER_USER_FAILED"> | Err<"PROVIDER_USER_INVALID">
>;

export interface IIdentityProviderGateway {
	createAuthorizationURL(state: string, codeVerifier: string): URL;
	exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GetTokensResult>;
	getProviderUser(tokens: OAuth2Tokens): Promise<GetProviderUserResult>;
	revokeToken(tokens: OAuth2Tokens): Promise<void>;
}
