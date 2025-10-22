import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { UserTableHelper } from "../../../../../../core/testing/helpers";
import { createProfileFixture } from "../../../../testing/fixtures/profile.fixture";
import { convertProfileToRaw } from "../../../../testing/helpers/converters";
import { ProfileRepository } from "../profile.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const profileRepository = new ProfileRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const { profile } = createProfileFixture();

describe("ProfileRepository.findById", async () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM users");
	});

	test("should return Profile instance if profile exists.", async () => {
		await userTableHelper.save(convertProfileToRaw(profile, null));

		const foundProfile = await profileRepository.findById(profile.id);

		expect(foundProfile).not.toBeNull();
		expect(convertProfileToRaw(foundProfile!, null)).toStrictEqual(convertProfileToRaw(profile, null));
	});

	test("should return null if profile not found.", async () => {
		const foundProfile = await profileRepository.findById(newUserId("invalidId"));
		expect(foundProfile).toBeNull();
	});
});
