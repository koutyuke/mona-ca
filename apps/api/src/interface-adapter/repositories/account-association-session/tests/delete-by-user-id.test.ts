import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createAccountAssociationSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

const { user } = createUserFixture();

describe("AccountAssociationSessionRepository.deleteByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should delete a sessions for a user", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
			},
		});
		await accountAssociationSessionTableHelper.save(accountAssociationSession);

		await accountAssociationSessionRepository.deleteByUserId(user.id);

		const sessions = await accountAssociationSessionTableHelper.findByUserId(user.id);
		expect(sessions).toHaveLength(0);
	});

	test("should not throw error when deleting for a user with no sessions", async () => {
		const userId = newUserId("nonExistentUser");

		// Should not throw an error
		await expect(accountAssociationSessionRepository.deleteByUserId(userId)).resolves.not.toThrow();
	});
});
