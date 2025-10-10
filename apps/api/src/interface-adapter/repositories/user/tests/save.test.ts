import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import type { User } from "../../../../domain/entities";
import { newGender } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserTableHelper, toRawDate } from "../../../../tests/helpers";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const now = new Date();

const { user, passwordHash } = userTableHelper.createData();

describe("UserRepository.save", async () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM users");
	});

	test("should set user in the database", async () => {
		await userRepository.save(user, {
			passwordHash,
		});

		const results = await userTableHelper.findById(user.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(userTableHelper.convertToRaw(user, passwordHash));
	});

	test("should update user in the database if user already exists", async () => {
		await userTableHelper.save(user, passwordHash);

		const updatedUser = {
			...user,
			name: "bar",
			email: "updatedUser@mail.com",
			emailVerified: true,
			iconUrl: "iconUrl",
			gender: newGender("woman"),
			updatedAt: now,
		} satisfies User;

		await userRepository.save(updatedUser, {
			passwordHash: "newPasswordHash",
		});

		const results = await userTableHelper.findById(user.id);
		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			id: user.id,
			name: "bar",
			email: "updatedUser@mail.com",
			email_verified: 1,
			icon_url: "iconUrl",
			gender: "woman",
			password_hash: "newPasswordHash",
			created_at: toRawDate(user.createdAt),
			updated_at: toRawDate(now),
		});
	});
});
