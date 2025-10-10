import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("UserRepository.findById", async () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM users");
	});

	test("should return User instance if user exists.", async () => {
		await userTableHelper.save(user, passwordHash);

		const foundUser = await userRepository.findById(user.id);

		expect(foundUser).not.toBeNull();
		expect(userTableHelper.convertToRaw(foundUser!, passwordHash)).toStrictEqual(
			userTableHelper.convertToRaw(user, passwordHash),
		);
	});

	test("should return null if user not found.", async () => {
		const foundUser = await userRepository.findById(newUserId("invalidId"));
		expect(foundUser).toBeNull();
	});
});
