import { err, ok } from "@mona-ca/core/result";
import { Value } from "@sinclair/typebox/value";
import {
	ArcticFetchError,
	Discord as DiscordProvider,
	OAuth2RequestError,
	UnexpectedErrorResponseBodyError,
	UnexpectedResponseError,
} from "arctic";
import { t } from "elysia";
import { newIdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";

import type { OAuth2Tokens } from "arctic";
import type {
	GetTokensResult,
	GetUserInfoResult,
	IIdentityProviderGateway,
	UserInfo,
} from "../../../application/ports/out/gateways/identity-provider.gateway.interface";

const discordUserDtoSchema = t.Object({
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

			// biome-ignore lint/suspicious/noConsole: Logging unexpected errors for debugging
			console.error("Unknown error in getTokens:", error);
			return err("FETCH_TOKENS_FAILED");
		}
	}

	public async getUserInfo(tokens: OAuth2Tokens): Promise<GetUserInfoResult> {
		try {
			const accessToken = tokens.accessToken();

			const response = await fetch("https://discord.com/api/v10/users/@me", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				return err("USER_INFO_GET_FAILED");
			}

			const user = await response.json();

			if (!Value.Check(discordUserDtoSchema, user)) {
				return err("INVALID_USER_INFO");
			}

			const userInfo: UserInfo = {
				id: newIdentityProvidersUserId(user.id),
				name: user.username,
				email: user.email,
				iconURL: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
				emailVerified: !!user.verified,
			};

			return ok({
				userInfo,
			});
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: Logging unexpected errors for debugging
			console.error("Error in getUserInfo:", error);
			return err("USER_INFO_GET_FAILED");
		}
	}

	public async revokeToken(tokens: OAuth2Tokens): Promise<void> {
		try {
			await this.discord.revokeToken(tokens.accessToken());
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: Logging revocation errors for debugging
			console.error("revokeToken request error", error);
		}
	}
}
