import { env } from "cloudflare:test";
import { describe, expect, test } from "vitest";
import { User } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

describe("UserRepository.create", async () => {
	test("should return a valid user object", async () => {
		const user = await userRepository.create(userTableHelper.baseUser);

		const expectedUser = new User({
			...userTableHelper.baseUser,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});

		expect(user).toStrictEqual(expectedUser);
	});

	test("should set user in the database", async () => {
		await userRepository.create(userTableHelper.baseUser);

		const results = await userTableHelper.find(userTableHelper.baseDatabaseUser.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(userTableHelper.baseDatabaseUser);
	});
});
