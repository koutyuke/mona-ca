import type { Gender, UserId } from "../../../../core/domain/value-objects";

export interface UserProfile {
	id: UserId;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: Gender;
	createdAt: Date;
	updatedAt: Date;
}

export const createUserProfile = (args: {
	id: UserId;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: Gender;
}): UserProfile => {
	const now = new Date();

	return {
		id: args.id,
		email: args.email,
		emailVerified: args.emailVerified,
		name: args.name,
		iconUrl: args.iconUrl,
		gender: args.gender,
		createdAt: now,
		updatedAt: now,
	};
};

export const updateUserProfile = (
	user: UserProfile,
	args: {
		name?: string;
		iconUrl?: string | null;
		gender?: Gender;
	},
): UserProfile => {
	const now = new Date();

	return {
		...user,
		...args,
		updatedAt: now,
	};
};
