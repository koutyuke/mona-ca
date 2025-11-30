import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountLinkSessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertAccountLinkSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAccountLinkSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { AccountLinkSessionRepository } from "../account-link-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountLinkSessionRepository = new AccountLinkSessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const accountLinkSessionTableDriver = new AccountLinkSessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();
const { userRegistration: userRegistration2 } = createAuthUserFixture({
	userRegistration: {
		email: "user2@example.com",
	},
});

describe("AccountLinkSessionRepository.deleteExpiredSessions", () => {
	beforeEach(async () => {
		await accountLinkSessionTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration2));
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

		await accountLinkSessionTableDriver.save(convertAccountLinkSessionToRaw(expiredSession.accountLinkSession));
		await accountLinkSessionTableDriver.save(convertAccountLinkSessionToRaw(validSession.accountLinkSession));

		await accountLinkSessionRepository.deleteExpiredSessions();

		const expiredSessionAfterDelete = await accountLinkSessionTableDriver.findById(
			expiredSession.accountLinkSession.id,
		);
		expect(expiredSessionAfterDelete).toHaveLength(0);

		const validSessionAfterDelete = await accountLinkSessionTableDriver.findById(validSession.accountLinkSession.id);

		expect(validSessionAfterDelete).toHaveLength(1);
		expect(validSessionAfterDelete[0]).toStrictEqual(convertAccountLinkSessionToRaw(validSession.accountLinkSession));
	});

	test("should do nothing when there are no expired sessions", async () => {
		const validSession = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration2.id,
			},
		});

		await accountLinkSessionTableDriver.save(convertAccountLinkSessionToRaw(validSession.accountLinkSession));

		await accountLinkSessionRepository.deleteExpiredSessions();

		const validSessionAfterDelete = await accountLinkSessionTableDriver.findById(validSession.accountLinkSession.id);

		expect(validSessionAfterDelete).toHaveLength(1);
		expect(validSessionAfterDelete[0]).toStrictEqual(convertAccountLinkSessionToRaw(validSession.accountLinkSession));
	});
});
