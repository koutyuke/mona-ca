import { t } from "elysia";

export const PublicSchema = t.Object({
	APP_ENV: t.Union([t.Literal("development"), t.Literal("production"), t.Literal("test")]),
});

export const PepperSchema = t.Object({
	PASSWORD_PEPPER: t.String(),
	SESSION_PEPPER: t.String(),
});

export const ResendSchema = t.Object({
	RESEND_API_KEY: t.String(),
});

export const UpstashRedisSchema = t.Object({
	UPSTASH_REDIS_REST_URL: t.String(),
	UPSTASH_REDIS_REST_TOKEN: t.String(),
});

export const OAuthProviderSchema = t.Object({
	DISCORD_CLIENT_ID: t.String(),
	DISCORD_CLIENT_SECRET: t.String(),
	GOOGLE_CLIENT_ID: t.String(),
	GOOGLE_CLIENT_SECRET: t.String(),
});

export const AppEnvWithoutCFModuleSchema = t.Intersect([
	PublicSchema,
	PepperSchema,
	ResendSchema,
	UpstashRedisSchema,
	OAuthProviderSchema,
]);
