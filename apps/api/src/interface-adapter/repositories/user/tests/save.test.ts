import { env } from "cloudflare:test";
import { describe, expect, test } from "vitest";
import type { User } from "../../../../domain/entities";
import { newGender } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserTableHelper } from "../../../../tests/helpers";
import { toDatabaseDate } from "../../../../tests/utils";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const now = new Date();

describe("UserRepository.save", async () => {
	test("should set user in the database", async () => {
		await userRepository.save(userTableHelper.baseData, {
			passwordHash: userTableHelper.basePasswordHash,
		});

		const results = await userTableHelper.find(userTableHelper.baseDatabaseData.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(userTableHelper.baseDatabaseData);
	});

	test("should update user in the database if user already exists", async () => {
		await userTableHelper.create();

		const updatedUser = {
			id: userTableHelper.baseData.id,
			name: "bar",
			email: "updatedUser@mail.com",
			emailVerified: true,
			iconUrl: "iconUrl",
			gender: newGender("woman"),
			createdAt: userTableHelper.baseData.createdAt,
			updatedAt: now,
		} satisfies User;

		await userRepository.save(updatedUser, {
			passwordHash: "newPasswordHash",
		});

		const results = await userTableHelper.find(userTableHelper.baseData.id);
		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			id: userTableHelper.baseData.id,
			name: "bar",
			email: "updatedUser@mail.com",
			email_verified: 1,
			icon_url: "iconUrl",
			gender: "woman",
			password_hash: "newPasswordHash",
			created_at: userTableHelper.baseDatabaseData.created_at,
			updated_at: toDatabaseDate(now),
		});
	});
});
