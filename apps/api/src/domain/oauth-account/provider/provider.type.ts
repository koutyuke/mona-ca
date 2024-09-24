import type { Static } from "elysia";
import type { oAuthProviderSchema } from "./provider.schema";

export type OAuthProvider = Static<typeof oAuthProviderSchema>;
