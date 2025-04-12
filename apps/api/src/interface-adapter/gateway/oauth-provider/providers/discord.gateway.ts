import { Value } from "@sinclair/typebox/value";
import { Discord as DiscordProvider, type OAuth2Tokens } from "arctic";
import { t } from "elysia";
import type { AccountInfo, IOAuthProviderGateway } from "../interfaces/oauth-provider.gateway.interface";

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

	public getTokens(code: string, codeVerifier: string): Promise<OAuth2Tokens> {
		return this.discord.validateAuthorizationCode(code, codeVerifier);
	}

	public async getAccountInfo(accessToken: string): Promise<AccountInfo | null> {
		const response = await fetch("https://discord.com/api/v10/users/@me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const user = await response.json();

		if (!Value.Check(discordAccountInfoSchema, user) || !user.email) {
			return null;
		}

		return {
			id: user.id,
			name: user.username,
			email: user.email,
			iconURL: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
			emailVerified: !!user.verified,
		};
	}

	public async revokeToken(token: string): Promise<void> {
		try {
			await this.discord.revokeToken(token);
		} catch (error) {
			console.error("revokeToken request error", error);
		}
	}
}
