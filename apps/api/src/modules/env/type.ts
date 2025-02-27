import type { Static } from "elysia";
import type {
	AppEnvWithoutCFModuleSchema,
	OAuthProviderSchema,
	PepperSchema,
	PublicSchema,
	ResendSchema,
	TurnstileSchema,
	UpstashRedisSchema,
} from "./schema";

export type PublicEnv = Static<typeof PublicSchema>;

export type PepperEnv = Static<typeof PepperSchema>;

export type ResendEnv = Static<typeof ResendSchema>;

export type UpstashRedisEnv = Static<typeof UpstashRedisSchema>;

export type TurnstileEnv = Static<typeof TurnstileSchema>;

export type OAuthProviderEnv = Static<typeof OAuthProviderSchema>;

export type AppEnvWithoutCFModule = Static<typeof AppEnvWithoutCFModuleSchema>;

export type CFModuleEnv = {
	DB: D1Database;
};

export type AppEnv = AppEnvWithoutCFModule & CFModuleEnv;
