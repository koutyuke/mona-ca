import { newGender, newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import type { UserProfile } from "../../domain/entities/user-profile";

export const createUserProfileFixture = (override?: {
	userProfile?: Partial<UserProfile>;
}): {
	userProfile: UserProfile;
} => {
	return {
		userProfile: {
			id: newUserId(ulid()),
			name: "testUser",
			email: "test.email@example.com",
			emailVerified: true,
			iconUrl: "http://example.com/icon-url",
			gender: newGender("male"),
			createdAt: new Date(1704067200 * 1000),
			updatedAt: new Date(1704067200 * 1000),
			...override?.userProfile,
		},
	};
};
