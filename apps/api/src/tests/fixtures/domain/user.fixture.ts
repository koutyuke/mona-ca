import { ulid } from "../../../common/utils";
import type { User } from "../../../domain/entities";
import { newGender, newUserId } from "../../../domain/value-object";

export const createUserFixture = (override?: {
	user?: Partial<User>;
}): {
	user: User;
} => {
	return {
		user: {
			id: override?.user?.id ?? newUserId(ulid()),
			name: override?.user?.name ?? "testUser",
			email: override?.user?.email ?? "test.email@example.com",
			emailVerified: override?.user?.emailVerified ?? true,
			iconUrl: override?.user?.iconUrl ?? "http://example.com/icon-url",
			gender: override?.user?.gender ?? newGender("man"),
			createdAt: override?.user?.createdAt ?? new Date(1704067200 * 1000),
			updatedAt: override?.user?.updatedAt ?? new Date(1704067200 * 1000),
		},
	};
};
