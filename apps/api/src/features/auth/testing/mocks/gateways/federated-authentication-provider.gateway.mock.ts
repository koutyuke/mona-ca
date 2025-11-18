import { ok } from "@mona-ca/core/utils";
import type { OAuth2Tokens } from "arctic";
import { ulid } from "../../../../../core/lib/id";
import type {
	GetIdentityResult,
	GetTokensResult,
	IFederatedAuthenticationProviderGateway,
} from "../../../application/ports/gateways/federated-authentication-provider.gateway.interface";
import { newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

export class FederatedAuthenticationProviderGatewayMock implements IFederatedAuthenticationProviderGateway {
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

	public async getIdentityProviderUser(_tokens: OAuth2Tokens): Promise<GetIdentityResult> {
		const identityProviderUser = {
			id: newIdentityProvidersUserId(ulid()),
			email: "test@example.com",
			name: "Test User",
			iconURL: "https://example.com/icon.png",
			emailVerified: true,
		};

		return ok({ identityProviderUser });
	}

	public async revokeToken(_tokens: OAuth2Tokens): Promise<void> {
		// Mock implementation - no-op
	}
}
