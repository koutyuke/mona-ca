import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
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

describe("AccountLinkSessionRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await accountLinkSessionTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete a sessions for a user", async () => {
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
			},
		});
		await accountLinkSessionTableDriver.save(convertAccountLinkSessionToRaw(accountLinkSession));

		await accountLinkSessionRepository.deleteByUserId(accountLinkSession.userId);

		const databaseSessions = await accountLinkSessionTableDriver.findByUserId(userRegistration.id);
		expect(databaseSessions).toHaveLength(0);
	});

	test("should not throw error when deleting for a user with no sessions", async () => {
		const userId = newUserId("nonExistentUser");

		// Should not throw an error
		await expect(accountLinkSessionRepository.deleteByUserId(userId)).resolves.not.toThrow();
	});
});
