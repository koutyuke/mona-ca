import { ok } from "@mona-ca/core/utils";
import type { OAuth2Tokens } from "arctic";
import type {
	GetIdentityResult,
	GetTokensResult,
	IOAuthProviderGateway,
} from "../../../application/ports/gateways/oauth-provider.gateway.interface";

export class OAuthProviderGatewayMock implements IOAuthProviderGateway {
	public createAuthorizationURL(state: string, codeVerifier: string): URL {
		return new URL(`https://provider.example.com/auth?state=${state}&code_verifier=${codeVerifier}`);
	}

	public async exchangeCodeForTokens(_code: string, _codeVerifier: string): Promise<GetTokensResult> {
		return ok({
			accessToken: () => "test_access_token",
			refreshToken: () => "test_refresh_token",
			accessTokenExpiresAt: () => new Date(Date.now() + 3600 * 1000),
		} as unknown as OAuth2Tokens);
	}

	public async getIdentity(_tokens: OAuth2Tokens): Promise<GetIdentityResult> {
		const providerIdentity = {
			id: "provider_user_id",
			email: "test@example.com",
			name: "Test User",
			iconURL: "https://example.com/icon.png",
			emailVerified: true,
		};

		return ok({ providerIdentity });
	}

	public async revokeToken(_tokens: OAuth2Tokens): Promise<void> {
		// Mock implementation - no-op
	}
}
