import { assert, beforeEach, describe, expect, it } from "vitest";
import { newGender, newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { createUserProfileFixture } from "../../../../testing/fixtures";
import { UserProfileRepositoryMock, createUserProfilesMap } from "../../../../testing/mocks/repositories";
import { UpdateUserProfileUseCase } from "../update-user-profile.usecase";

const userProfileMap = createUserProfilesMap();

const userProfileRepository = new UserProfileRepositoryMock({
	userProfileMap,
});

const updateUserProfileUseCase = new UpdateUserProfileUseCase(userProfileRepository);

const { userProfile } = createUserProfileFixture({
	userProfile: {
		name: "Original Name",
		email: "test@example.com",
		emailVerified: true,
		iconUrl: "https://example.com/original-icon.png",
		gender: newGender("male"),
	},
});

describe("UpdateUserProfileUseCase", () => {
	beforeEach(() => {
		userProfileMap.clear();
		userProfileMap.set(userProfile.id, userProfile);
	});

	it("Success: should update user profile with all fields", async () => {
		const originalUpdatedAt = userProfile.updatedAt;

		const dto = {
			name: "Updated Name",
			iconUrl: "https://example.com/updated-icon.png",
			gender: newGender("female"),
		};

		const result = await updateUserProfileUseCase.execute(userProfile.id, dto);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { userProfile: updatedProfile } = result.value;

		expect(updatedProfile.id).toBe(userProfile.id);
		expect(updatedProfile.name).toBe("Updated Name");
		expect(updatedProfile.iconUrl).toBe("https://example.com/updated-icon.png");
		expect(updatedProfile.gender).toBe(newGender("female"));

		// 更新されていないフィールドは元の値のまま
		expect(updatedProfile.email).toBe(userProfile.email);
		expect(updatedProfile.emailVerified).toBe(userProfile.emailVerified);
		expect(updatedProfile.createdAt).toStrictEqual(userProfile.createdAt);

		// updatedAtが更新されていること
		expect(updatedProfile.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

		// リポジトリに保存されていること
		const savedProfile = userProfileMap.get(userProfile.id);
		expect(savedProfile).toStrictEqual(updatedProfile);
	});

	it("Success: should update user profile with only name", async () => {
		const originalUpdatedAt = userProfile.updatedAt;

		const dto = {
			name: "New Name Only",
		};

		const result = await updateUserProfileUseCase.execute(userProfile.id, dto);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { userProfile: updatedProfile } = result.value;

		expect(updatedProfile.name).toBe("New Name Only");
		expect(updatedProfile.iconUrl).toBe(userProfile.iconUrl);
		expect(updatedProfile.gender).toBe(userProfile.gender);
		expect(updatedProfile.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
	});

	it("Success: should update user profile with only iconUrl", async () => {
		const originalUpdatedAt = userProfile.updatedAt;

		const dto = {
			iconUrl: "https://example.com/new-icon.png",
		};

		const result = await updateUserProfileUseCase.execute(userProfile.id, dto);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { userProfile: updatedProfile } = result.value;

		expect(updatedProfile.iconUrl).toBe("https://example.com/new-icon.png");
		expect(updatedProfile.name).toBe(userProfile.name);
		expect(updatedProfile.gender).toBe(userProfile.gender);
		expect(updatedProfile.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
	});

	it("Success: should update user profile with only gender", async () => {
		const originalUpdatedAt = userProfile.updatedAt;

		const dto = {
			gender: newGender("female"),
		};

		const result = await updateUserProfileUseCase.execute(userProfile.id, dto);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { userProfile: updatedProfile } = result.value;

		expect(updatedProfile.gender).toBe(newGender("female"));
		expect(updatedProfile.name).toBe(userProfile.name);
		expect(updatedProfile.iconUrl).toBe(userProfile.iconUrl);
		expect(updatedProfile.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
	});

	it("Success: should set iconUrl to null when provided", async () => {
		const originalUpdatedAt = userProfile.updatedAt;

		const dto = {
			iconUrl: null,
		};

		const result = await updateUserProfileUseCase.execute(userProfile.id, dto);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { userProfile: updatedProfile } = result.value;

		expect(updatedProfile.iconUrl).toBeNull();
		expect(updatedProfile.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
	});

	it("Success: should update user profile with empty dto (no changes)", async () => {
		const originalUpdatedAt = userProfile.updatedAt;

		const dto = {};

		const result = await updateUserProfileUseCase.execute(userProfile.id, dto);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { userProfile: updatedProfile } = result.value;

		// すべてのフィールドが元の値のまま
		expect(updatedProfile.name).toBe(userProfile.name);
		expect(updatedProfile.iconUrl).toBe(userProfile.iconUrl);
		expect(updatedProfile.gender).toBe(userProfile.gender);

		// updatedAtは更新される（updateUserProfile関数の仕様）
		expect(updatedProfile.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
	});

	it("Error: should return USER_NOT_FOUND error when user does not exist", async () => {
		const nonExistentUserId = newUserId(ulid());

		const dto = {
			name: "New Name",
		};

		const result = await updateUserProfileUseCase.execute(nonExistentUserId, dto);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("USER_NOT_FOUND");

		// プロファイルが更新されていないこと
		const originalProfile = userProfileMap.get(userProfile.id);
		expect(originalProfile).toStrictEqual(userProfile);
	});
});
