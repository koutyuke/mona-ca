import { assert, beforeEach, describe, expect, it } from "vitest";
import { newGender, newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { createUserProfileFixture } from "../../../../testing/fixtures";
import { createUserProfileMap, UserProfileRepositoryMock } from "../../../../testing/mocks/repositories";
import { GetUserProfileUseCase } from "../get-user-profile.usecase";

const userProfileMap = createUserProfileMap();

const userProfileRepository = new UserProfileRepositoryMock({
	userProfileMap,
});

const getUserProfileUseCase = new GetUserProfileUseCase(userProfileRepository);

const { userProfile } = createUserProfileFixture({
	userProfile: {
		name: "Test User",
		email: "test@example.com",
		emailVerified: true,
		iconUrl: "https://example.com/icon.png",
		gender: newGender("male"),
	},
});

describe("GetUserProfileUseCase", () => {
	beforeEach(() => {
		userProfileMap.clear();
	});

	it("Success: should return user profile when user exists", async () => {
		userProfileMap.set(userProfile.id, userProfile);

		const result = await getUserProfileUseCase.execute(userProfile.id);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { userProfile: returnedUserProfile } = result.value;

		expect(returnedUserProfile.id).toBe(userProfile.id);
		expect(returnedUserProfile.name).toBe(userProfile.name);
		expect(returnedUserProfile.email).toBe(userProfile.email);
		expect(returnedUserProfile.emailVerified).toBe(userProfile.emailVerified);
		expect(returnedUserProfile.iconUrl).toBe(userProfile.iconUrl);
		expect(returnedUserProfile.gender).toBe(userProfile.gender);
		expect(returnedUserProfile.createdAt).toBeInstanceOf(Date);
		expect(returnedUserProfile.updatedAt).toBeInstanceOf(Date);
	});

	it("Error: should return USER_NOT_FOUND error when user does not exist", async () => {
		const nonExistentUserId = newUserId(ulid());

		const result = await getUserProfileUseCase.execute(nonExistentUserId);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("USER_NOT_FOUND");
	});
});
