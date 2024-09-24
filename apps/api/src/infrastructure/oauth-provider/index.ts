export type {
	IOAuthProviderService as IOAuthProviderGateway,
	AccountInfo,
} from "./interface/oauth-provider.service.interface";
export { DiscordOAuthService } from "./providers/discord.service";
export { selectOAuthProviderService } from "./utils/select-oauth-provider-service";
