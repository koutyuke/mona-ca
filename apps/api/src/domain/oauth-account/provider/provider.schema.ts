import { t } from "elysia";

export const oAuthProviderSchema = t.Union([t.Literal("discord")]);
