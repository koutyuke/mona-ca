import { env } from "cloudflare:test";
import { afterEach, describe, expect, test } from "vitest";
import { newGender } from "../../../../../../core/domain/value-objects";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { toRawBoolean, toRawDate, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertUserProfileToRaw } from "../../../../testing/converters/converters";
import { createUserProfileFixture } from "../../../../testing/fixtures/user-profile.fixture";
import { UserProfileRepository } from "../user-profile.repository";

import type { UserProfile } from "../../../../domain/entities/user-profile";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userProfileRepository = new UserProfileRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);

const now = new Date();

const { userProfile } = createUserProfileFixture();

describe("UserProfileRepository.save", async () => {
	afterEach(async () => {
		await userTableDriver.deleteAll();
	});

	test("should update userProfile in the database if userProfile already exists", async () => {
		await userTableDriver.save(convertUserProfileToRaw(userProfile, null));

		const updatedUserProfile = {
			...userProfile,
			name: "bar",
			iconUrl: "iconUrl",
			gender: newGender("female"),
			updatedAt: now,
		} satisfies UserProfile;

		await userProfileRepository.save(updatedUserProfile);

		const results = await userTableDriver.findById(updatedUserProfile.id);
		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			id: updatedUserProfile.id,
			name: "bar",
			email: updatedUserProfile.email,
			email_verified: toRawBoolean(userProfile.emailVerified),
			icon_url: "iconUrl",
			gender: "female",
			password_hash: null,
			created_at: toRawDate(userProfile.createdAt),
			updated_at: toRawDate(updatedUserProfile.updatedAt),
		});
	});
});
