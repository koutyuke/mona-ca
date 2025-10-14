import { type Static, t } from "elysia";
import type { User } from "../../domain/entities";

export const UserPresenterResultSchema = t.Object({
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

export type UserPresenterResult = Static<typeof UserPresenterResultSchema>;

export const UserPresenter = (user: User): UserPresenterResult => {
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
