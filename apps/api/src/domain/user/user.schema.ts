import { t } from "elysia";

export const UserSchema = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String({ format: "email" }),
	emailVerified: t.Boolean(),
	iconUrl: t.Union([t.String(), t.Null()]),
	gender: t.Union([t.Literal("man"), t.Literal("woman")]),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});
