import { t } from "elysia";

export const clientSchema = t.Union([t.Literal("web"), t.Literal("mobile")]);
