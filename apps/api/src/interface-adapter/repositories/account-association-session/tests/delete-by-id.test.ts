import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newAccountAssociationSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

describe("AccountAssociationSessionRepository.delete", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should delete session by id", async () => {
		await accountAssociationSessionTableHelper.create();

		await accountAssociationSessionRepository.deleteById(accountAssociationSessionTableHelper.baseData.id);

		const databaseSessions = await accountAssociationSessionTableHelper.findById(
			accountAssociationSessionTableHelper.baseData.id,
		);
		expect(databaseSessions).toHaveLength(0);
	});

	test("should not throw error when deleting non-existent session", async () => {
		const nonExistentSessionId = newAccountAssociationSessionId("nonExistentSessionId");

		await expect(accountAssociationSessionRepository.deleteById(nonExistentSessionId)).resolves.not.toThrow();

		await expect(accountAssociationSessionRepository.deleteById(nonExistentSessionId)).resolves.not.toThrow();
	});
});
