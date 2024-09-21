import type { Static } from "elysia";
import type { oAuthProviderSchema } from "../schema/provider.schema";

export type OAuthProvider = Static<typeof oAuthProviderSchema>;
