import type { UserId } from "../../../../core/domain/value-objects";

export interface UserIdentity {
	id: UserId;
	email: string;
	emailVerified: boolean;
	passwordHash: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export const updateUserIdentity = (
	userIdentity: UserIdentity,
	args: {
		email?: string;
		emailVerified?: boolean;
		passwordHash?: string | null;
	},
): UserIdentity => {
	const now = new Date();

	return {
		...userIdentity,
		email: args.email ?? userIdentity.email,
		emailVerified: args.emailVerified ?? userIdentity.emailVerified,
		passwordHash: args.passwordHash ?? userIdentity.passwordHash,
		updatedAt: now,
	};
};
