import { err, ok } from "@mona-ca/core/result";
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
	GetTokensResult,
	GetUserInfoResult,
	IIdentityProviderGateway,
	UserInfo,
} from "../../../application/ports/out/gateways/identity-provider.gateway.interface";
import { newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

const googleIdTokenClaimsSchema = t.Object({
	sub: t.String(),
	name: t.String(),
	email: t.String(),
	picture: t.Optional(t.String()),
	email_verified: t.Optional(t.Boolean()),
});

export class GoogleIdentityProviderGateway implements IIdentityProviderGateway {
	private readonly google: GoogleProvider;
	private readonly scope = ["openid", "profile", "email"];

	constructor(clientId: string, clientSecret: string, redirectURI: string) {
		this.google = new GoogleProvider(clientId, clientSecret, redirectURI);
	}

	public createAuthorizationURL(state: string, codeVerifier: string): URL {
		const url = this.google.createAuthorizationURL(state, codeVerifier, this.scope);
		return url;
	}

	public async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GetTokensResult> {
		try {
			const tokens = await this.google.validateAuthorizationCode(code, codeVerifier);
			return ok(tokens);
		} catch (error) {
			if (error instanceof OAuth2RequestError) {
				console.error(error);
				return err("CREDENTIALS_INVALID");
			}
			if (error instanceof ArcticFetchError) {
				return err("FETCH_TOKENS_FAILED");
			}
			if (error instanceof UnexpectedResponseError) {
				return err("FETCH_TOKENS_FAILED");
			}
			if (error instanceof UnexpectedErrorResponseBodyError) {
				return err("FETCH_TOKENS_FAILED");
			}

			console.error("Unknown error in getTokens:", error);
			return err("FETCH_TOKENS_FAILED");
		}
	}

	public async getUserInfo(tokens: OAuth2Tokens): Promise<GetUserInfoResult> {
		try {
			const idToken = tokens.idToken();

			const claims = decodeIdToken(idToken);

			if (!Value.Check(googleIdTokenClaimsSchema, claims)) {
				return err("INVALID_USER_INFO");
			}

			const userInfo: UserInfo = {
				id: newIdentityProvidersUserId(claims.sub),
				name: claims.name,
				email: claims.email,
				iconURL: claims.picture ?? null,
				emailVerified: claims.email_verified ?? false,
			};

			return ok({
				userInfo,
			});
		} catch (error) {
			console.error("Error in getUserInfo:", error);
			return err("USER_INFO_GET_FAILED");
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
