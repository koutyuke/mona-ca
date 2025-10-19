import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newGender } from "../../../../../../shared/domain/value-objects";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { UserTableHelper, toRawBoolean, toRawDate } from "../../../../../../shared/testing/helpers";
import type { Profile } from "../../../../domain/entities/profile";
import { createProfileFixture } from "../../../../testing/fixtures/profile.fixture";
import { convertProfileToRaw } from "../../../../testing/helpers/converters";
import { ProfileRepository } from "../profile.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const profileRepository = new ProfileRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const now = new Date();

const { profile } = createProfileFixture();

describe("ProfileRepository.save", async () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM users");
	});

	test("should update profile in the database if profile already exists", async () => {
		await userTableHelper.save(convertProfileToRaw(profile, null));

		const updatedProfile = {
			...profile,
			name: "bar",
			iconUrl: "iconUrl",
			gender: newGender("woman"),
			updatedAt: now,
		} satisfies Profile;

		await profileRepository.save(updatedProfile);

		const results = await userTableHelper.findById(profile.id);
		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			id: profile.id,
			name: "bar",
			email: profile.email,
			email_verified: toRawBoolean(profile.emailVerified),
			icon_url: "iconUrl",
			gender: "woman",
			password_hash: null,
			created_at: toRawDate(profile.createdAt),
			updated_at: toRawDate(now),
		});
	});
});
