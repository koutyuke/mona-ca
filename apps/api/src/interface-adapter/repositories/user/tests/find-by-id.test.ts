import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

describe("UserRepository.findById", async () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should return User instance if user exists.", async () => {
		const foundUser = await userRepository.findById(userTableHelper.baseUser.id);

		expect(foundUser).toStrictEqual(userTableHelper.baseUser);
	});

	test("should return null if user not found.", async () => {
		const foundUser = await userRepository.findById(newUserId("invalidId"));
		expect(foundUser).toBeNull();
	});
});
