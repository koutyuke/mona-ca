import { newGender, newUserId } from "../../../../shared/domain/value-objects";
import { ulid } from "../../../../shared/lib/id";
import type { Profile } from "../../domain/entities/profile";

export const createProfileFixture = (override?: {
	profile?: Partial<Profile>;
}): {
	profile: Profile;
} => {
	return {
		profile: {
			id: newUserId(ulid()),
			name: "testUser",
			email: "test.email@example.com",
			emailVerified: true,
			iconUrl: "http://example.com/icon-url",
			gender: newGender("man"),
			createdAt: new Date(1704067200 * 1000),
			updatedAt: new Date(1704067200 * 1000),
			...override?.profile,
		},
	};
};
