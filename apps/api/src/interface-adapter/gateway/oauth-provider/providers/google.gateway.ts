import { Value } from "@sinclair/typebox/value";
import {
	ArcticFetchError,
	Google as GoogleProvider,
	OAuth2RequestError,
	type OAuth2Tokens,
	UnexpectedErrorResponseBodyError,
	UnexpectedResponseError,
	decodeIdToken,
} from "arctic";
import { t } from "elysia";
import type {
	GetAccountInfoResult,
	GetTokensResult,
	IOAuthProviderGateway,
} from "../../../../application/ports/out/gateways";
import { err } from "../../../../common/utils";

const googleIdTokenClaimsSchema = t.Object({
	sub: t.String(),
	name: t.String(),
	email: t.String(),
	picture: t.Optional(t.String()),
	email_verified: t.Optional(t.Boolean()),
});

export class GoogleOAuthGateway implements IOAuthProviderGateway {
	private readonly google: GoogleProvider;
	private readonly scope = ["openid", "profile", "email"];

	constructor(clientId: string, clientSecret: string, redirectURI: string) {
		this.google = new GoogleProvider(clientId, clientSecret, redirectURI);
	}

	public genAuthURL(state: string, codeVerifier: string): URL {
		const url = this.google.createAuthorizationURL(state, codeVerifier, this.scope);
		return url;
	}

	public async getTokens(code: string, codeVerifier: string): Promise<GetTokensResult> {
		try {
			const tokens = await this.google.validateAuthorizationCode(code, codeVerifier);
			return tokens;
		} catch (error) {
			if (error instanceof OAuth2RequestError) {
				console.error(error);
				return err("OAUTH_CREDENTIALS_INVALID");
			}
			if (error instanceof ArcticFetchError) {
				return err("FAILED_TO_FETCH_OAUTH_TOKENS");
			}
			if (error instanceof UnexpectedResponseError) {
				return err("FAILED_TO_FETCH_OAUTH_TOKENS");
			}
			if (error instanceof UnexpectedErrorResponseBodyError) {
				return err("FAILED_TO_FETCH_OAUTH_TOKENS");
			}

			console.error("Unknown error in getTokens:", error);
			return err("FAILED_TO_FETCH_OAUTH_TOKENS");
		}
	}

	public async getAccountInfo(tokens: OAuth2Tokens): Promise<GetAccountInfoResult> {
		try {
			const idToken = tokens.idToken();

			const claims = decodeIdToken(idToken);

			if (!Value.Check(googleIdTokenClaimsSchema, claims)) {
				return err("OAUTH_ACCOUNT_INFO_INVALID");
			}

			return {
				id: claims.sub,
				name: claims.name,
				email: claims.email,
				iconURL: claims.picture ?? null,
				emailVerified: claims.email_verified ?? false,
			};
		} catch (error) {
			console.error("Error in getAccountInfo:", error);
			return err("FAILED_TO_GET_ACCOUNT_INFO");
		}
	}

	public async revokeToken(tokens: OAuth2Tokens): Promise<void> {
		try {
			await this.google.revokeToken(tokens.accessToken());
		} catch (error) {
			console.error("revokeToken request error", error);
		}
	}
}
