import { t } from "elysia";

export const clientSchema = t.Union([t.Literal("web"), t.Literal("mobile")]);

export const genderSchema = t.Union([t.Literal("man"), t.Literal("woman")]);
