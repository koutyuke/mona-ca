import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { UserCredential } from "../../../../domain/entities/user-credential";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserCredentialTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { UserCredentialRepository } from "../user-credential.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userCredentialsRepository = new UserCredentialRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const userCredentialTableHelper = new UserCredentialTableHelper(DB);

describe("UserCredentialRepository.create", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should return created userCredential", async () => {
		const userCredential = await userCredentialsRepository.create(userCredentialTableHelper.baseUserCredential);

		const expectedUserCredential = new UserCredential(userCredentialTableHelper.baseUserCredential);

		expect(userCredential).toStrictEqual(expectedUserCredential);
	});

	test("should set userCredential in the database", async () => {
		await userCredentialsRepository.create(userCredentialTableHelper.baseUserCredential);

		const userCredentials = await userCredentialTableHelper.find(userTableHelper.baseDatabaseUser.id);

		expect(userCredentials).toHaveLength(1);
		expect(userCredentials[0]).toStrictEqual(userCredentialTableHelper.baseDatabaseUserCredential);
	});
});
