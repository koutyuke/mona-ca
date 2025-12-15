import { ok } from "@mona-ca/core/result";
import type { OAuth2Tokens } from "arctic";
import { ulid } from "../../../../../core/lib/id";
import type {
	GetTokensResult,
	GetUserInfoResult,
	IIdentityProviderGateway,
	UserInfo,
} from "../../../application/ports/out/gateways/identity-provider.gateway.interface";
import { newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

export class IdentityProviderGatewayMock implements IIdentityProviderGateway {
	private readonly userInfo: UserInfo = {
		id: newIdentityProvidersUserId(ulid()),
		email: "test@example.com",
		name: "Test User",
		iconURL: "https://example.com/icon.png",
		emailVerified: true,
	};
	constructor(override?: {
		userInfo?: Partial<UserInfo>;
	}) {
		this.userInfo = {
			...this.userInfo,
			...override?.userInfo,
		};
	}

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

	public async getUserInfo(_tokens: OAuth2Tokens): Promise<GetUserInfoResult> {
		return ok({ userInfo: this.userInfo });
	}

	public async revokeToken(_tokens: OAuth2Tokens): Promise<void> {
		// Mock implementation - no-op
	}
}
