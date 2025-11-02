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

describe("AccountLinkSessionRepository.save", () => {
	beforeEach(async () => {
		await accountLinkSessionTableHelper.deleteAll();
		await userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create data in database", async () => {
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
			},
		});

		await accountLinkSessionRepository.save(accountLinkSession);

		const results = await accountLinkSessionTableHelper.findById(accountLinkSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertAccountLinkSessionToRaw(accountLinkSession));
	});
});
