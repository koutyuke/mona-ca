import type { OAuth2Tokens } from "arctic";
import type {
	GetAccountInfoResult,
	GetTokensResult,
	IOAuthProviderGateway,
} from "../../../interface-adapter/gateway/oauth-provider";

export class OAuthProviderGatewayMock implements IOAuthProviderGateway {
	public genAuthURL(state: string, codeVerifier: string): URL {
		return new URL(`https://provider.example.com/auth?state=${state}&code_verifier=${codeVerifier}`);
	}

	public async getTokens(_code: string, _codeVerifier: string): Promise<GetTokensResult> {
		return {
			accessToken: () => "test_access_token",
			refreshToken: () => "test_refresh_token",
			accessTokenExpiresAt: () => new Date(Date.now() + 3600 * 1000),
		} as unknown as OAuth2Tokens;
	}

	public async getAccountInfo(_accessToken: string): Promise<GetAccountInfoResult> {
		return {
			id: "provider_user_id",
			email: "test@example.com",
			name: "Test User",
			iconURL: "https://example.com/icon.png",
			emailVerified: true,
		};
	}

	public async revokeToken(_token: string): Promise<void> {
		// Mock implementation - no-op
	}
}
