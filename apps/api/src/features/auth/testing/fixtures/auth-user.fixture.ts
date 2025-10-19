import { newGender, newUserId } from "../../../../shared/domain/value-objects";
import { ulid } from "../../../../shared/lib/id";
import type { UserIdentity } from "../../domain/entities/user-identity";
import type { UserRegistration } from "../../domain/entities/user-registration";

export const createAuthUserFixture = (override?: {
	userRegistration?: Partial<UserRegistration>;
	userIdentity?: Partial<UserIdentity>;
}): {
	userRegistration: UserRegistration;
	userIdentity: UserIdentity;
} => {
	const userRegistration = {
		id: newUserId(ulid()),
		email: "test.email@example.com",
		emailVerified: true,
		passwordHash: "passwordHash",
		name: "testUser",
		iconUrl: "http://example.com/icon-url",
		gender: newGender("man"),
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
	} satisfies UserIdentity;

	return {
		userRegistration,
		userIdentity,
	};
};
