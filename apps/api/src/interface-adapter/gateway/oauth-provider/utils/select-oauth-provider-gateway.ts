import type { OAuthProvider } from "@/domain/oauth-account/provider";
import type { OAuthProviderEnv } from "@/modules/env";
import type { IOAuthProviderGateway } from "../interface/oauth-provider.gateway.interface";
import { DiscordOAuthGateway } from "../providers/discord.gateway";

const selectOAuthProviderGateway = (args: {
	provider: OAuthProvider;
	env: OAuthProviderEnv;
	redirectUrl: string;
}): IOAuthProviderGateway => {
	const { provider, env, redirectUrl } = args;
	switch (provider) {
		case "discord":
			return new DiscordOAuthGateway(env.DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, redirectUrl);
		default:
			throw new Error(`Unsupported OAuth provider: ${provider}`);
	}
};

export { selectOAuthProviderGateway };
