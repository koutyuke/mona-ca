import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
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

describe("AccountLinkSessionRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await accountLinkSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete a sessions for a user", async () => {
		const { session } = createAccountLinkSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await accountLinkSessionTableHelper.save(convertAccountLinkSessionToRaw(session));

		await accountLinkSessionRepository.deleteByUserId(userRegistration.id);

		const sessions = await accountLinkSessionTableHelper.findByUserId(userRegistration.id);
		expect(sessions).toHaveLength(0);
	});

	test("should not throw error when deleting for a user with no sessions", async () => {
		const userId = newUserId("nonExistentUser");

		// Should not throw an error
		await expect(accountLinkSessionRepository.deleteByUserId(userId)).resolves.not.toThrow();
	});
});
