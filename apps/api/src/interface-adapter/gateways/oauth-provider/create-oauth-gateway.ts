import type { ToPrimitive } from "@mona-ca/core/utils";
import type { IOAuthProviderGateway } from "../../../application/ports/out/gateways";
import type { ExternalIdentityProvider } from "../../../domain/value-object";
import type { OAuthProviderEnv } from "../../../modules/env";
import { DiscordOAuthGateway } from "./discord.gateway";
import { GoogleOAuthGateway } from "./google.gateway";

const oauthProviderMap: Record<
	ToPrimitive<ExternalIdentityProvider>,
	typeof DiscordOAuthGateway | typeof GoogleOAuthGateway
> = {
	discord: DiscordOAuthGateway,
	google: GoogleOAuthGateway,
};

export const createOAuthGateway = (
	env: OAuthProviderEnv,
	provider: ExternalIdentityProvider,
	redirectURI: string,
): IOAuthProviderGateway => {
	return new oauthProviderMap[provider as ToPrimitive<ExternalIdentityProvider>](
		env.DISCORD_CLIENT_ID,
		env.DISCORD_CLIENT_SECRET,
		redirectURI,
	);
};
