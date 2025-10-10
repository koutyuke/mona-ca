import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newAccountAssociationSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createAccountAssociationSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

const { user, passwordHash } = createUserFixture();

describe("AccountAssociationSessionRepository.delete", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should delete session by id", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
			},
		});
		await accountAssociationSessionTableHelper.save(accountAssociationSession);

		await accountAssociationSessionRepository.deleteById(accountAssociationSession.id);

		const databaseSessions = await accountAssociationSessionTableHelper.findById(accountAssociationSession.id);
		expect(databaseSessions).toHaveLength(0);
	});

	test("should not throw error when deleting non-existent session", async () => {
		const nonExistentSessionId = newAccountAssociationSessionId("nonExistentSessionId");

		await expect(accountAssociationSessionRepository.deleteById(nonExistentSessionId)).resolves.not.toThrow();
	});
});
