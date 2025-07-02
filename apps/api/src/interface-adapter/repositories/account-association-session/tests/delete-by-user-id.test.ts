import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

describe("AccountAssociationSessionRepository.deleteByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should delete a sessions for a user", async () => {
		await accountAssociationSessionTableHelper.create(accountAssociationSessionTableHelper.baseDatabaseData);

		await accountAssociationSessionRepository.deleteByUserId(accountAssociationSessionTableHelper.baseData.userId);

		const sessions = await accountAssociationSessionTableHelper.findByUserId(
			accountAssociationSessionTableHelper.baseData.userId,
		);
		expect(sessions).toHaveLength(0);
	});

	test("should not throw error when deleting for a user with no sessions", async () => {
		const userId = newUserId("nonExistentUser");

		// Should not throw an error
		await expect(accountAssociationSessionRepository.deleteByUserId(userId)).resolves.not.toThrow();
	});
});
