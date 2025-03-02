import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { UserCredential } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { UserCredentialTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { UserCredentialRepository } from "../user-credential.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const userCredentialsRepository = new UserCredentialRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const userCredentialTableHelper = new UserCredentialTableHelper(DB);

describe("UserCredentialRepository.find", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await userCredentialTableHelper.create();
	});

	test("should return userCredential from userId", async () => {
		const userCredentials = await userCredentialsRepository.find(userCredentialTableHelper.baseUserCredential.userId);

		const expectedUserCredential = new UserCredential(userCredentialTableHelper.baseUserCredential);

		expect(userCredentials).toStrictEqual(expectedUserCredential);
	});

	test("should return null if userCredential not found", async () => {
		const userCredentials = await userCredentialsRepository.find("wrongUserId");
		expect(userCredentials).toBeNull();
	});
});
