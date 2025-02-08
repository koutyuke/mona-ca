import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { User } from "../../../../models/entities/user";
import { type DatabaseUser, UserTableHelper } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

describe("UserRepository.update", async () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should return a updated User instance", async () => {
		const updatedUser = await userRepository.update("userId", {
			name: "bar",
			email: "updatedUser@mail.com",
			emailVerified: true,
			iconUrl: "iconUrl",
			gender: "woman",
		});
		const expectedUser = new User({
			id: userTableHelper.baseUser.id,
			name: "bar",
			email: "updatedUser@mail.com",
			emailVerified: true,
			iconUrl: "iconUrl",
			gender: "woman",
			createdAt: updatedUser.createdAt,
			updatedAt: updatedUser.updatedAt,
		});

		expect(updatedUser).toStrictEqual(expectedUser);
	});

	test("should update user in the database", async () => {
		await userRepository.update("userId", {
			name: "bar",
			email: "updatedUser@mail.com",
			emailVerified: true,
			iconUrl: "http://example.com/update.png",
			gender: "woman",
		});

		const results = await userTableHelper.find("userId");

		const expectedDatabaseUser = {
			...userTableHelper.baseDatabaseUser,
			name: "bar",
			email: "updatedUser@mail.com",
			email_verified: 1,
			icon_url: "http://example.com/update.png",
			gender: "woman",
			updated_at: results[0]!.updated_at,
		} satisfies DatabaseUser;

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(expectedDatabaseUser);
	});
});
