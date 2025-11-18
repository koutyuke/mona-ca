import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountLinkSessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { createAccountLinkSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { convertAccountLinkSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { AccountLinkSessionRepository } from "../account-link-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountLinkSessionRepository = new AccountLinkSessionRepository(drizzleService);

const userTableHelper = new UsersTableDriver(DB);
const accountLinkSessionTableHelper = new AccountLinkSessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkSessionRepository.save", () => {
	beforeEach(async () => {
		await accountLinkSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create a new session in the database", async () => {
		const { session } = createAccountLinkSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await accountLinkSessionRepository.save(session);

		const databaseSessions = await accountLinkSessionTableHelper.findById(session.id);

		expect(databaseSessions.length).toBe(1);
		expect(databaseSessions[0]).toStrictEqual(convertAccountLinkSessionToRaw(session));
	});
});
