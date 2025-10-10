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

const { user, passwordHash } = userTableHelper.createData();

describe("AccountAssociationSessionRepository.deleteByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should delete a sessions for a user", async () => {
		const { session } = accountAssociationSessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await accountAssociationSessionTableHelper.save(session);

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
