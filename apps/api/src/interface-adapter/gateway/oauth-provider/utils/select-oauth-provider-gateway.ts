import type { OAuthProviderEnv } from "@/modules/env";
import { DiscordOAuthGateway } from "../discord.gateway";
import type { OAuthProvider } from "../types/provider.type";

const selectOAuthProviderGateway = (args: {
	provider: OAuthProvider;
	env: OAuthProviderEnv;
	redirectUri: string;
}) => {
	const { provider, env, redirectUri } = args;
	switch (provider) {
		case "discord":
			return new DiscordOAuthGateway(env.DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, redirectUri);
		default:
			throw new Error(`Unsupported OAuth provider: ${provider}`);
	}
};

export { selectOAuthProviderGateway };
