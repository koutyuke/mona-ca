import type { Static } from "elysia";
import type { AppEnvWithoutCFModuleEnvSchema, AppStatusEnvSchema, OAuthProviderEnvSchema } from "./env.schema";

export type AppStatusEnv = Static<typeof AppStatusEnvSchema>;

export type OAuthProviderEnv = Static<typeof OAuthProviderEnvSchema>;

export type AppEnvWithoutCFModuleEnv = Static<typeof AppEnvWithoutCFModuleEnvSchema>;

export type CFModuleEnv = {
	DB: D1Database;
};

export type AppEnv = AppEnvWithoutCFModuleEnv & CFModuleEnv;
