import { type Static, t } from "elysia";
import type { User } from "../../domain/entities";

export const UserResponseSchema = t.Object({
	id: t.String(),
	email: t.String({
		format: "email",
	}),
	emailVerified: t.Boolean(),
	name: t.String(),
	iconUrl: t.Union([t.String(), t.Null()]),
	gender: t.Union([t.Literal("man"), t.Literal("woman")]),
	createdAt: t.String({
		format: "date-time",
	}),
	updatedAt: t.String({
		format: "date-time",
	}),
});

export type UserResponse = Static<typeof UserResponseSchema>;

export const toUserResponse = (user: User): UserResponse => {
	return {
		id: user.id,
		email: user.email,
		emailVerified: user.emailVerified,
		name: user.name,
		iconUrl: user.iconUrl ? user.iconUrl.toString() : null,
		gender: user.gender,
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
	};
};
