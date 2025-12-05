import { err, ok } from "@mona-ca/core/result";
import { Value } from "@sinclair/typebox/value";
import {
	ArcticFetchError,
	Discord as DiscordProvider,
	OAuth2RequestError,
	type OAuth2Tokens,
	UnexpectedErrorResponseBodyError,
	UnexpectedResponseError,
} from "arctic";
import { t } from "elysia";

import type {
	GetProviderUserResult,
	GetTokensResult,
	IIdentityProviderGateway,
	IdentityProviderUser,
} from "../../../application/ports/gateways/identity-provider.gateway.interface";
import { newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

const discordUserResponseSchema = t.Object({
	id: t.String(),
	username: t.String(),
	discriminator: t.String(),
	global_name: t.Union([t.String(), t.Null()]),
	avatar: t.Union([t.String(), t.Null()]),
	banner: t.Union([t.String(), t.Null()]),
	accent_color: t.Union([t.Integer(), t.Null()]),
	verified: t.Union([t.Boolean(), t.Null()]),
	email: t.String({ format: "email" }),
});

export class DiscordIdentityProviderGateway implements IIdentityProviderGateway {
	private readonly discord: DiscordProvider;
	private readonly scope = ["identify", "email"];

	constructor(clientId: string, clientSecret: string, redirectURI: string) {
		this.discord = new DiscordProvider(clientId, clientSecret, redirectURI);
	}

	public createAuthorizationURL(state: string, codeVerifier: string): URL {
		const url = this.discord.createAuthorizationURL(state, codeVerifier, this.scope);
		return url;
	}

	public async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GetTokensResult> {
		try {
			const tokens = await this.discord.validateAuthorizationCode(code, codeVerifier);
			return ok(tokens);
		} catch (error) {
			if (error instanceof OAuth2RequestError) {
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

	public async getIdentityProviderUser(tokens: OAuth2Tokens): Promise<GetProviderUserResult> {
		try {
			const accessToken = tokens.accessToken();

			const response = await fetch("https://discord.com/api/v10/users/@me", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					return err("ACCESS_TOKEN_INVALID");
				}
				return err("FETCH_IDENTITY_FAILED");
			}

			const user = await response.json();

			if (!Value.Check(discordUserResponseSchema, user)) {
				return err("IDENTITY_INVALID");
			}

			const identityProviderUser: IdentityProviderUser = {
				id: newIdentityProvidersUserId(user.id),
				name: user.username,
				email: user.email,
				iconURL: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
				emailVerified: !!user.verified,
			};

			return ok({
				identityProviderUser,
			});
		} catch (error) {
			console.error("Error in getAccountInfo:", error);
			return err("FETCH_IDENTITY_FAILED");
		}
	}

	public async revokeToken(tokens: OAuth2Tokens): Promise<void> {
		try {
			await this.discord.revokeToken(tokens.accessToken());
		} catch (error) {
			console.error("revokeToken request error", error);
		}
	}
}
