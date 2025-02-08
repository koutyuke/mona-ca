import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserCredential } from "../../../../models/entities/user-credential";
import { UserCredentialTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { UserCredentialRepository } from "../user-credential.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userCredentialRepository = new UserCredentialRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const userCredentialTableHelper = new UserCredentialTableHelper(DB);

describe("UserCredentialRepository.update", () => {
	beforeAll(async () => {
		await userTableHelper.create(userTableHelper.baseDatabaseUser);
		await userCredentialTableHelper.create(userCredentialTableHelper.baseDatabaseUserCredential);
	});

	test("should return updated userCredential", async () => {
		const userCredential = await userCredentialRepository.update(userCredentialTableHelper.baseUserCredential.userId, {
			passwordHash: "UpdatedPasswordHash",
		});

		const expectedUserCredential = new UserCredential({
			...userCredentialTableHelper.baseUserCredential,
			passwordHash: "UpdatedPasswordHash",
			createdAt: userCredential.createdAt,
			updatedAt: userCredential.updatedAt,
		});

		expect(userCredential).toStrictEqual(expectedUserCredential);
	});

	test("should update userCredential table in DB", async () => {
		await userCredentialRepository.update("userId", {
			passwordHash: "UpdatedPasswordHash",
		});

		const userCredentials = await userCredentialTableHelper.find("userId");

		expect(userCredentials).toHaveLength(1);
		expect(userCredentials[0]).toStrictEqual({
			...userCredentialTableHelper.baseDatabaseUserCredential,
			password_hash: "UpdatedPasswordHash",
			updated_at: userCredentials[0]!.updated_at,
		});
	});
});
