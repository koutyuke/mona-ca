import { newGender } from "../../../../core/domain/value-objects";

import type { Gender, UserId } from "../../../../core/domain/value-objects";

export const DEFAULT_USER_GENDER = newGender("male") satisfies Gender;

/**
 * It represents the complete information of a user registration.
 * Only used when creating a new user.
 */
export interface UserRegistration {
	id: UserId;
	email: string;
	emailVerified: boolean;
	passwordHash: string | null;
	name: string;
	iconUrl: string | null;
	gender: Gender;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Creates a new user registration.
 */
export const createUserRegistration = (args: {
	id: UserId;
	email: string;
	emailVerified: boolean;
	passwordHash: string | null;
	name: string;
	iconUrl: string | null;
	gender: Gender;
}): UserRegistration => {
	const now = new Date();

	return {
		id: args.id,
		email: args.email,
		emailVerified: args.emailVerified,
		passwordHash: args.passwordHash,
		name: args.name,
		iconUrl: args.iconUrl,
		gender: args.gender,
		createdAt: now,
		updatedAt: now,
	};
};
