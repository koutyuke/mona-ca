export type {
	IOAuthProviderService as IOAuthProviderGateway,
	AccountInfo,
} from "./interface/oauth-provider.service.interface";
export { DiscordOAuthService } from "./providers/discord.service";
export type { OAuthProvider } from "./types/provider.type";
export { oAuthProviderSchema } from "./schema/provider.schema";
export { selectOAuthProviderService } from "./utils/select-oauth-provider-service";
