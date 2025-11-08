import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountLinkSessionTableHelper, UserTableHelper } from "../../../../../../core/testing/helpers";
import { createAccountLinkSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { convertAccountLinkSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { AccountLinkSessionRepository } from "../account-link-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountLinkSessionRepository = new AccountLinkSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountLinkSessionTableHelper = new AccountLinkSessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkSessionRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await accountLinkSessionTableHelper.deleteAll();
		await userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete data in database", async () => {
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
			},
		});
		await accountLinkSessionTableHelper.save(convertAccountLinkSessionToRaw(accountLinkSession));

		await accountLinkSessionRepository.deleteByUserId(accountLinkSession.userId);

		const results = await accountLinkSessionTableHelper.findByUserId(accountLinkSession.userId);

		expect(results.length).toBe(0);
	});
});
