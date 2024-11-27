import { t } from "elysia";
import type { User } from "../../domain/user";

export type UserPresenterResult = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: "man" | "woman";
	createdAt: string;
	updatedAt: string;
};

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

export const userPresenter = (user: User): UserPresenterResult => {
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
