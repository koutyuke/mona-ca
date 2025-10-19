import type { Gender, UserId } from "../../../../shared/domain/value-objects";

export interface Profile {
	id: UserId;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: Gender;
	createdAt: Date;
	updatedAt: Date;
}

export const createProfile = (args: {
	id: UserId;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: Gender;
}): Profile => {
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

export const updateProfile = (
	user: Profile,
	args: {
		name?: string;
		iconUrl?: string | null;
		gender?: Gender;
	},
): Profile => {
	const now = new Date();

	return {
		...user,
		...args,
		updatedAt: now,
	};
};
