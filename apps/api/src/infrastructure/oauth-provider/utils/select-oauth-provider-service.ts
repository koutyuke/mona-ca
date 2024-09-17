import type { OAuthProviderEnv } from "@/modules/env";
import { DiscordOAuthService } from "../providers/discord.service";
import type { OAuthProvider } from "../types/provider.type";

const selectOAuthProviderService = (args: {
	provider: OAuthProvider;
	env: OAuthProviderEnv;
	redirectUri: string;
}) => {
	const { provider, env, redirectUri } = args;
	switch (provider) {
		case "discord":
			return new DiscordOAuthService(env.DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, redirectUri);
		default:
			throw new Error(`Unsupported OAuth provider: ${provider}`);
	}
};

export { selectOAuthProviderService };
