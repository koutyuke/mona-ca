import { newGender, newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import type { UserCredentials } from "../../domain/entities/user-credentials";
import type { UserRegistration } from "../../domain/entities/user-registration";

export const createAuthUserFixture = (override?: {
	userRegistration?: Partial<UserRegistration>;
	userIdentity?: Partial<UserCredentials>;
}): {
	userRegistration: UserRegistration;
	userIdentity: UserCredentials;
} => {
	const userRegistration = {
		id: newUserId(ulid()),
		email: "test.email@example.com",
		emailVerified: true,
		passwordHash: "passwordHash",
		name: "testUser",
		iconUrl: "http://example.com/icon-url",
		gender: newGender("male"),
		createdAt: new Date(1704067200 * 1000),
		updatedAt: new Date(1704067200 * 1000),
		...override?.userRegistration,
	} satisfies UserRegistration;

	const userIdentity = {
		id: userRegistration.id,
		email: userRegistration.email,
		emailVerified: userRegistration.emailVerified,
		passwordHash: userRegistration.passwordHash,
		createdAt: userRegistration.createdAt,
		updatedAt: userRegistration.updatedAt,
		...override?.userIdentity,
	} satisfies UserCredentials;

	return {
		userRegistration,
		userIdentity,
	};
};
