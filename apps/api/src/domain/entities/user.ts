import type { Gender } from "../value-object/gender";
import type { UserId } from "../value-object/ids";

export interface User {
	id: UserId;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: Gender;
	createdAt: Date;
	updatedAt: Date;
}

export const createUser = (args: {
	id: UserId;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: Gender;
}): User => {
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

export const updateUser = (
	user: User,
	args: {
		name?: string;
		iconUrl?: string | null;
		gender?: Gender;
		email?: string;
		emailVerified?: boolean;
	},
): User => {
	const now = new Date();

	return {
		...user,
		...args,
		updatedAt: now,
	};
};
