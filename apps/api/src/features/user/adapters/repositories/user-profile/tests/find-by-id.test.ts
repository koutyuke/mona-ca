import { env } from "cloudflare:test";
import { afterEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertUserProfileToRaw } from "../../../../testing/converters/converters";
import { createUserProfileFixture } from "../../../../testing/fixtures/user-profile.fixture";
import { UserProfileRepository } from "../user-profile.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userProfileRepository = new UserProfileRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);

const { userProfile } = createUserProfileFixture();

describe("UserProfileRepository.findById", async () => {
	afterEach(async () => {
		await userTableDriver.deleteAll();
	});

	test("should return UserProfile instance if userProfile exists.", async () => {
		await userTableDriver.save(convertUserProfileToRaw(userProfile, null));

		const foundUserProfile = await userProfileRepository.findById(userProfile.id);

		expect(foundUserProfile).not.toBeNull();
		expect(convertUserProfileToRaw(foundUserProfile!, null)).toStrictEqual(convertUserProfileToRaw(userProfile, null));
	});

	test("should return null if userProfile not found.", async () => {
		const foundUserProfile = await userProfileRepository.findById(newUserId("invalidId"));
		expect(foundUserProfile).toBeNull();
	});
});
