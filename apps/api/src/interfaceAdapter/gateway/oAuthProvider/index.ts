export type { IOAuthProviderGateway, AccountInfo } from "./interface/IOAuthProviderGateway";
export { DiscordOAuthGateway } from "./discord.gateway";
export { oAuthProviderSchema as providerSchema } from "./schema/provider.schema";
export type { OAuthProvider } from "./types/provider.type";
export { oAuthProviderSchema } from "./schema/provider.schema";
export { selectOAuthProviderGateway } from "./utils/selectOAuthProviderGateway";
