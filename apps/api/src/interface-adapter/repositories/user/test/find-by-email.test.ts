import { env } from "cloudflare:test";
import { User } from "@/domain/user";
import { DrizzleService } from "@/infrastructure/drizzle";
import { UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
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
		const foundUser = await userRepository.findByEmail(userTableHelper.baseUser.email);

		const expectedUser = new User({
			...userTableHelper.baseUser,
			createdAt: foundUser!.createdAt,
			updatedAt: foundUser!.updatedAt,
		});

		expect(foundUser).toStrictEqual(expectedUser);
	});

	test("should return null if user not found", async () => {
		const invalidUser = await userRepository.findByEmail("invalidEmail@mail.com");
		expect(invalidUser).toBeNull();
	});
});
