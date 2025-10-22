import type { Static } from "elysia";
import type {
	EnvVariablesSchema,
	HMACSecretSchema,
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

export type HMACSecretEnv = Static<typeof HMACSecretSchema>;

export type EnvVariables = Static<typeof EnvVariablesSchema>;

export type CloudflareBindings = {
	DB: D1Database;
};

export type Env = EnvVariables & CloudflareBindings;
