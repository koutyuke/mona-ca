import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createUserFixture } from "../../../../tests/fixtures";
import { UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const { user } = createUserFixture();

describe("UserRepository.delete", async () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM users");
	});

	test("should deleted user from the database", async () => {
		await userTableHelper.save(user, null);

		await userRepository.deleteById(user.id);

		const results = await userTableHelper.findById(user.id);

		expect(results).toHaveLength(0);
	});
});
