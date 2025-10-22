import type { IOAuthProviderGateway } from "../../../application/ports/gateways/oauth-provider.gateway.interface";

type OAuthFlow = "signup" | "login" | "link";
export type ProviderGateways = Record<OAuthFlow, IOAuthProviderGateway>;
