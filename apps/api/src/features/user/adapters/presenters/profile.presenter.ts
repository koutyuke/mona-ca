import type { Profile } from "../../domain/entities/profile";

type ProfileResponse = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: "man" | "woman";
	createdAt: string;
	updatedAt: string;
};

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
