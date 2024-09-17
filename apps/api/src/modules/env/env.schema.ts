import { t } from "elysia";

export const AppStatusEnvSchema = t.Object({
	APP_ENV: t.Union([t.Literal("development"), t.Literal("production"), t.Literal("test")]),
});

export const OAuthProviderEnvSchema = t.Object({
	DISCORD_CLIENT_ID: t.String(),
	DISCORD_CLIENT_SECRET: t.String(),
	GOOGLE_CLIENT_ID: t.String(),
	GOOGLE_CLIENT_SECRET: t.String(),
	RESEND_DEFAULT_EMAIL_API_KEY: t.String(),
});

export const AppEnvWithoutCFModuleEnvSchema = t.Intersect([AppStatusEnvSchema, OAuthProviderEnvSchema]);
