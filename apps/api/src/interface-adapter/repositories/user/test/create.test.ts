import { env } from "cloudflare:test";
import { User } from "@/domain/user";
import { UserCredential } from "@/domain/user-credential";
import { DrizzleService } from "@/infrastructure/drizzle";
import { UserCredentialTableHelper, UserTableHelper } from "@/tests/helpers";
import { describe, expect, test } from "vitest";
import { UserRepository } from "../user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userRepository = new UserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const userCredentialsTableHelper = new UserCredentialTableHelper(DB);

describe("UserRepository.create", async () => {
	test("should return a valid user object", async () => {
		const { user, userCredential } = await userRepository.create(
			userTableHelper.baseUser,
			userCredentialsTableHelper.baseUserCredential,
		);

		const expectedUser = new User({
			...userTableHelper.baseUser,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		});

		const expectedUserCredential = new UserCredential({
			...userCredentialsTableHelper.baseUserCredential,
			createdAt: userCredential.createdAt,
			updatedAt: userCredential.updatedAt,
		});

		expect(user).toStrictEqual(expectedUser);
		expect(userCredential).toStrictEqual(expectedUserCredential);
	});

	test("should set user in the database", async () => {
		await userRepository.create(userTableHelper.baseUser, userCredentialsTableHelper.baseUserCredential);

		const results = await userTableHelper.find(userTableHelper.baseDatabaseUser.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			...userTableHelper.baseDatabaseUser,
			created_at: results[0]!.created_at,
			updated_at: results[0]!.updated_at,
		});
	});
});
