import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { User } from "../../../../domain/entities";
import { newSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { user } = createUserFixture();

describe("UserRepository.findBySessionId", async () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM sessions");
	});

	test("should return User instance if user exists.", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});
		await sessionTableHelper.save(session);

		const foundUser = await userRepository.findBySessionId(session.id);

		const expectedUser = userTableHelper.convertToRaw(user, null);

		expect(foundUser).not.toBeNull();
		const foundDatabaseUser = userTableHelper.convertToRaw(foundUser as User, null);
		expect(foundDatabaseUser).toStrictEqual({
			...expectedUser,
			created_at: foundDatabaseUser.created_at,
			updated_at: foundDatabaseUser.updated_at,
		});
	});

	test("should return null if user not found.", async () => {
		const foundUser = await userRepository.findBySessionId(newSessionId("invalidSessionId"));
		expect(foundUser).toBeNull();
	});
});
