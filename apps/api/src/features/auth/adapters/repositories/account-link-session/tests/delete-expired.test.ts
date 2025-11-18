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
const { userRegistration: userRegistration2 } = createAuthUserFixture({
	userRegistration: {
		email: "user2@example.com",
	},
});

describe("AccountLinkSessionRepository.deleteExpiredSessions", () => {
	beforeEach(async () => {
		await accountLinkSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration2));
	});

	test("should delete expired sessions but keep valid ones", async () => {
		const expiredSession = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				expiresAt: new Date(0),
			},
		});

		const validSession = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration2.id,
			},
		});

		await accountLinkSessionTableHelper.save(convertAccountLinkSessionToRaw(expiredSession.accountLinkSession));
		await accountLinkSessionTableHelper.save(convertAccountLinkSessionToRaw(validSession.accountLinkSession));

		await accountLinkSessionRepository.deleteExpiredSessions();

		const expiredSessionAfterDelete = await accountLinkSessionTableHelper.findById(
			expiredSession.accountLinkSession.id,
		);
		expect(expiredSessionAfterDelete).toHaveLength(0);

		const validSessionAfterDelete = await accountLinkSessionTableHelper.findById(validSession.accountLinkSession.id);

		expect(validSessionAfterDelete).toHaveLength(1);
		expect(validSessionAfterDelete[0]).toStrictEqual(convertAccountLinkSessionToRaw(validSession.accountLinkSession));
	});

	test("should do nothing when there are no expired sessions", async () => {
		const validSession = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration2.id,
			},
		});

		await accountLinkSessionTableHelper.save(convertAccountLinkSessionToRaw(validSession.accountLinkSession));

		await accountLinkSessionRepository.deleteExpiredSessions();

		const validSessionAfterDelete = await accountLinkSessionTableHelper.findById(validSession.accountLinkSession.id);

		expect(validSessionAfterDelete).toHaveLength(1);
		expect(validSessionAfterDelete[0]).toStrictEqual(convertAccountLinkSessionToRaw(validSession.accountLinkSession));
	});
});
