import { type Static, t } from "elysia";
import type { Profile } from "../../domain/entities/profile";

export const ProfileResponseSchema = t.Object({
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

export type ProfileResponse = Static<typeof ProfileResponseSchema>;

export const toProfileResponse = (profile: Profile): ProfileResponse => {
	return {
		id: profile.id,
		email: profile.email,
		emailVerified: profile.emailVerified,
		name: profile.name,
		iconUrl: profile.iconUrl ? profile.iconUrl.toString() : null,
		gender: profile.gender,
		createdAt: profile.createdAt.toISOString(),
		updatedAt: profile.updatedAt.toISOString(),
	};
};
