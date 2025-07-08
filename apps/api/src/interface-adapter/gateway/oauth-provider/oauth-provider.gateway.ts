import type { OAuthProvider } from "../../../domain/value-object";
import type { OAuthProviderEnv } from "../../../modules/env";
import type { IOAuthProviderGateway } from "./interfaces/oauth-provider.gateway.interface";
import { DiscordOAuthGateway } from "./providers/discord.gateway";
import { GoogleOAuthGateway } from "./providers/google.gateway";

const OAuthProviderGateway = (
	env: OAuthProviderEnv,
	provider: OAuthProvider,
	redirectURI: string,
): IOAuthProviderGateway => {
	switch (provider) {
		case "discord":
			return new DiscordOAuthGateway(env.DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, redirectURI);
		case "google":
			return new GoogleOAuthGateway(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectURI);
		default:
			throw new Error(`Unsupported OAuth provider: ${provider}`);
	}
};

export { OAuthProviderGateway };
