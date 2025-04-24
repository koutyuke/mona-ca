import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

describe("AccountAssociationSessionRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should create a new session in the database", async () => {
		await accountAssociationSessionRepository.save(accountAssociationSessionTableHelper.baseSession);

		const databaseSessions = await accountAssociationSessionTableHelper.findById(
			accountAssociationSessionTableHelper.baseSession.id,
		);

		expect(databaseSessions.length).toBe(1);
		expect(databaseSessions[0]).toStrictEqual(accountAssociationSessionTableHelper.baseDatabaseSession);
	});
});
