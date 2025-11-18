import type { IIdentityProviderGateway } from "../../../application/ports/gateways/identity-provider.gateway.interface";

type FederatedAuthenticationFlow = "signup" | "login" | "link";
export type IdentityProviderGateways = Record<FederatedAuthenticationFlow, IIdentityProviderGateway>;
