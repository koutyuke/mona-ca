import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

describe("UserRepository.delete", async () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should deleted user from the database", async () => {
		await userRepository.delete(userTableHelper.baseData.id);

		const results = await userTableHelper.find(userTableHelper.baseData.id);

		expect(results).toHaveLength(0);
	});
});
