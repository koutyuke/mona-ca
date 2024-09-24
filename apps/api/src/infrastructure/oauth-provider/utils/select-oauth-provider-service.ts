import type { OAuthProvider } from "@/domain/oauth-account/provider";
import type { OAuthProviderEnv } from "@/modules/env";
import type { IOAuthProviderService } from "../interface/oauth-provider.service.interface";
import { DiscordOAuthService } from "../providers/discord.service";

const selectOAuthProviderService = (args: {
	provider: OAuthProvider;
	env: OAuthProviderEnv;
	redirectUrl: string;
}): IOAuthProviderService => {
	const { provider, env, redirectUrl } = args;
	switch (provider) {
		case "discord":
			return new DiscordOAuthService(env.DISCORD_CLIENT_ID, env.DISCORD_CLIENT_SECRET, redirectUrl);
		default:
			throw new Error(`Unsupported OAuth provider: ${provider}`);
	}
};

export { selectOAuthProviderService };
