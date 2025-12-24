import type { UserProfile } from "../../domain/entities/user-profile";

type UserProfileResponse = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: "male" | "female";
	createdAt: string;
	updatedAt: string;
};

export const toUserProfileResponse = (userProfile: UserProfile): UserProfileResponse => {
	return {
		id: userProfile.id,
		email: userProfile.email,
		emailVerified: userProfile.emailVerified,
		name: userProfile.name,
		iconUrl: userProfile.iconUrl ? userProfile.iconUrl.toString() : null,
		gender: userProfile.gender,
		createdAt: userProfile.createdAt.toISOString(),
		updatedAt: userProfile.updatedAt.toISOString(),
	};
};
