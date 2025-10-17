import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { createUserFixture } from "../../../../../../tests/fixtures";
import { UserTableHelper } from "../../../../../../tests/helpers";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const { user } = createUserFixture();

describe("UserRepository.findByEmail", async () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM users");
	});

	test("should return User instance if user exists", async () => {
		await userTableHelper.save(user, null);

		const foundUser = await userRepository.findByEmail(user.email);

		const expectedUser = userTableHelper.convertToRaw(user, null);

		expect(foundUser).not.toBeNull();
		expect(userTableHelper.convertToRaw(foundUser!, null)).toStrictEqual(expectedUser);
	});

	test("should return null if user not found", async () => {
		const invalidUser = await userRepository.findByEmail("invalidEmail@mail.com");
		expect(invalidUser).toBeNull();
	});
});
