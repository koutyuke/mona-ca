import type { UserId } from "../../../../core/domain/value-objects";

export interface UserCredentials {
	id: UserId;
	email: string;
	emailVerified: boolean;
	passwordHash: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export const updateUserCredentials = (
	userCredentials: UserCredentials,
	args: {
		email?: string;
		emailVerified?: boolean;
		passwordHash?: string | null;
	},
): UserCredentials => {
	const now = new Date();

	return {
		...userCredentials,
		email: args.email ?? userCredentials.email,
		emailVerified: args.emailVerified ?? userCredentials.emailVerified,
		passwordHash: args.passwordHash ?? userCredentials.passwordHash,
		updatedAt: now,
	};
};
