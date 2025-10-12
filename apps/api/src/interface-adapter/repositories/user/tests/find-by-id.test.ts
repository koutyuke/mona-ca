import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createUserFixture } from "../../../../tests/fixtures";
import { UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const { user } = createUserFixture();

describe("UserRepository.findById", async () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM users");
	});

	test("should return User instance if user exists.", async () => {
		await userTableHelper.save(user, null);

		const foundUser = await userRepository.findById(user.id);

		expect(foundUser).not.toBeNull();
		expect(userTableHelper.convertToRaw(foundUser!, null)).toStrictEqual(userTableHelper.convertToRaw(user, null));
	});

	test("should return null if user not found.", async () => {
		const foundUser = await userRepository.findById(newUserId("invalidId"));
		expect(foundUser).toBeNull();
	});
});
