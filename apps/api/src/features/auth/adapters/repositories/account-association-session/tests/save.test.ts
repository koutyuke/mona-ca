import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createUserFixture } from "../../../../../../tests/fixtures";
import { createAccountAssociationSessionFixture } from "../../../../../../tests/fixtures";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../../../tests/helpers";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

const { user } = createUserFixture();

describe("AccountAssociationSessionRepository.save", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	test("should create a new session in the database", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
			},
		});
		await accountAssociationSessionRepository.save(accountAssociationSession);

		const databaseSessions = await accountAssociationSessionTableHelper.findById(accountAssociationSession.id);

		expect(databaseSessions.length).toBe(1);
		expect(databaseSessions[0]).toStrictEqual(
			accountAssociationSessionTableHelper.convertToRaw(accountAssociationSession),
		);
	});
});
