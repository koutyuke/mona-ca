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

const { user, passwordHash } = userTableHelper.createData();

describe("AccountAssociationSessionRepository.save", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	test("should create a new session in the database", async () => {
		const { session } = accountAssociationSessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await accountAssociationSessionRepository.save(session);

		const databaseSessions = await accountAssociationSessionTableHelper.findById(session.id);

		expect(databaseSessions.length).toBe(1);
		expect(databaseSessions[0]).toStrictEqual(accountAssociationSessionTableHelper.convertToRaw(session));
	});
});
