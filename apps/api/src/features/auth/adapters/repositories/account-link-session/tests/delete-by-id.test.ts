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

const userTableHelper = new UsersTableDriver(DB);
const accountLinkSessionTableHelper = new AccountLinkSessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkSessionRepository.delete", () => {
	beforeEach(async () => {
		await accountLinkSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete session by id", async () => {
		const { accountLinkSession: session } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
			},
		});
		await accountLinkSessionTableHelper.save(convertAccountLinkSessionToRaw(session));

		await accountLinkSessionRepository.deleteById(session.id);

		const databaseSessions = await accountLinkSessionTableHelper.findById(session.id);
		expect(databaseSessions).toHaveLength(0);
	});

	test("should not throw error when deleting non-existent session", async () => {
		const nonExistentSessionId = newAccountLinkSessionId("nonExistentSessionId");

		await expect(accountLinkSessionRepository.deleteById(nonExistentSessionId)).resolves.not.toThrow();
	});
});
