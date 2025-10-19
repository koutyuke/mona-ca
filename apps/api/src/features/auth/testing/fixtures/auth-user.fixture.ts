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
		id: override?.userRegistration?.id ?? newUserId(ulid()),
		email: override?.userRegistration?.email ?? "test.email@example.com",
		emailVerified: override?.userRegistration?.emailVerified ?? true,
		passwordHash: override?.userRegistration?.passwordHash ?? "passwordHash",
		name: override?.userRegistration?.name ?? "testUser",
		iconUrl: override?.userRegistration?.iconUrl ?? "http://example.com/icon-url",
		gender: override?.userRegistration?.gender ?? newGender("man"),
		createdAt: override?.userRegistration?.createdAt ?? new Date(1704067200 * 1000),
		updatedAt: override?.userRegistration?.updatedAt ?? new Date(1704067200 * 1000),
	} satisfies UserRegistration;

	const userIdentity = {
		id: override?.userIdentity?.id ?? userRegistration.id,
		email: override?.userIdentity?.email ?? userRegistration.email,
		emailVerified: override?.userIdentity?.emailVerified ?? userRegistration.emailVerified,
		passwordHash: override?.userIdentity?.passwordHash ?? userRegistration.passwordHash,
		createdAt: override?.userIdentity?.createdAt ?? userRegistration.createdAt,
		updatedAt: override?.userIdentity?.updatedAt ?? userRegistration.updatedAt,
	} satisfies UserIdentity;

	return {
		userRegistration,
		userIdentity,
	};
};
