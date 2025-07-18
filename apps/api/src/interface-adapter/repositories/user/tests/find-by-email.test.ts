import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

describe("UserRepository.findByEmail", async () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should return User instance if user exists", async () => {
		const foundUser = await userRepository.findByEmail(userTableHelper.baseData.email);

		expect(foundUser).toStrictEqual(userTableHelper.baseData);
	});

	test("should return null if user not found", async () => {
		const invalidUser = await userRepository.findByEmail("invalidEmail@mail.com");
		expect(invalidUser).toBeNull();
	});
});
