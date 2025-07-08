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
import { err } from "../../../../common/utils";
import type {
	GetAccountInfoResult,
	GetTokensResult,
	IOAuthProviderGateway,
} from "../interfaces/oauth-provider.gateway.interface";

const discordAccountInfoSchema = t.Object({
	id: t.String(),
	username: t.String(),
	discriminator: t.String(),
	global_name: t.Union([t.String(), t.Null()]),
	avatar: t.Union([t.String(), t.Null()]),
	banner: t.Union([t.String(), t.Null()]),
	accent_color: t.Union([t.Integer(), t.Null()]),
	verified: t.Union([t.Boolean(), t.Null()]),
	email: t.Union([t.String({ format: "email" }), t.Null()]),
});

export class DiscordOAuthGateway implements IOAuthProviderGateway {
	private readonly discord: DiscordProvider;
	private readonly scope = ["identify", "email"];

	constructor(clientId: string, clientSecret: string, redirectURI: string) {
		this.discord = new DiscordProvider(clientId, clientSecret, redirectURI);
	}

	public genAuthURL(state: string, codeVerifier: string): URL {
		const url = this.discord.createAuthorizationURL(state, codeVerifier, this.scope);
		return url;
	}

	public async getTokens(code: string, codeVerifier: string): Promise<GetTokensResult> {
		try {
			const tokens = await this.discord.validateAuthorizationCode(code, codeVerifier);
			return tokens;
		} catch (error) {
			if (error instanceof OAuth2RequestError) {
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
			const accessToken = tokens.accessToken();

			const response = await fetch("https://discord.com/api/v10/users/@me", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					return err("OAUTH_ACCESS_TOKEN_INVALID");
				}
				return err("FAILED_TO_GET_ACCOUNT_INFO");
			}

			const user = await response.json();

			if (!Value.Check(discordAccountInfoSchema, user)) {
				return err("OAUTH_ACCOUNT_INFO_INVALID");
			}

			if (!user.email) {
				return err("OAUTH_ACCOUNT_EMAIL_NOT_FOUND");
			}

			return {
				id: user.id,
				name: user.username,
				email: user.email,
				iconURL: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
				emailVerified: !!user.verified,
			};
		} catch (error) {
			console.error("Error in getAccountInfo:", error);
			return err("FAILED_TO_GET_ACCOUNT_INFO");
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
