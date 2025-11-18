import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountLinkSessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newAccountLinkSessionId } from "../../../../domain/value-objects/ids";
import { createAccountLinkSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { convertAccountLinkSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { AccountLinkSessionRepository } from "../account-link-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountLinkSessionRepository = new AccountLinkSessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const accountLinkSessionTableDriver = new AccountLinkSessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkSessionRepository.delete", () => {
	beforeEach(async () => {
		await accountLinkSessionTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete session by id", async () => {
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
			},
		});
		await accountLinkSessionTableDriver.save(convertAccountLinkSessionToRaw(accountLinkSession));

		await accountLinkSessionRepository.deleteById(accountLinkSession.id);

		const databaseSessions = await accountLinkSessionTableDriver.findById(accountLinkSession.id);
		expect(databaseSessions).toHaveLength(0);
	});

	test("should not throw error when deleting non-existent session", async () => {
		const nonExistentSessionId = newAccountLinkSessionId("nonExistentSessionId");

		await expect(accountLinkSessionRepository.deleteById(nonExistentSessionId)).resolves.not.toThrow();
	});
});
