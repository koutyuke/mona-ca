import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import type { User } from "../../../../domain/entities";
import { newSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("UserRepository.findBySessionId", async () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should return User instance if user exists.", async () => {
		const foundUser = await userRepository.findBySessionId(sessionTableHelper.baseData.id);

		const expectedUser = {
			...userTableHelper.baseData,
			createdAt: foundUser!.createdAt,
			updatedAt: foundUser!.updatedAt,
		} satisfies User;

		expect(foundUser).toStrictEqual(expectedUser);
	});

	test("should return null if user not found.", async () => {
		const foundUser = await userRepository.findBySessionId(newSessionId("invalidSessionId"));
		expect(foundUser).toBeNull();
	});
});
