export type { IOAuthProviderGateway, AccountInfo } from "./interface/oauth-provider.gateway.interface";
export { DiscordOAuthGateway } from "./providers/discord.gateway";
export { oAuthProviderSchema as providerSchema } from "./schema/provider.schema";
export type { OAuthProvider } from "./types/provider.type";
export { oAuthProviderSchema } from "./schema/provider.schema";
export { selectOAuthProviderGateway } from "./utils/select-oauth-provider-gateway";
