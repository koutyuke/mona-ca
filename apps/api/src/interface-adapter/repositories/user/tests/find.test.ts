import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { User } from "../../../../domain/entities/user";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

describe("UserRepository.find", async () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should return User instance if user exists.", async () => {
		const foundUser = await userRepository.find("userId");

		const expectedUser = new User({
			...userTableHelper.baseUser,
			createdAt: foundUser!.createdAt,
			updatedAt: foundUser!.updatedAt,
		});

		expect(foundUser).toStrictEqual(expectedUser);
	});

	test("should return null if user not found.", async () => {
		const foundUser = await userRepository.find("invalidId");
		expect(foundUser).toBeNull();
	});
});
