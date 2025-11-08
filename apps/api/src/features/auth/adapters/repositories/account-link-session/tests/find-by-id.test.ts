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

describe("AccountLinkSessionRepository.findById", () => {
	beforeEach(async () => {
		await accountLinkSessionTableHelper.deleteAll();
		await userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should find data in database", async () => {
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
			},
		});

		await accountLinkSessionTableHelper.save(convertAccountLinkSessionToRaw(accountLinkSession));

		const result = await accountLinkSessionRepository.findById(accountLinkSession.id);

		expect(result).not.toBeNull();
		expect(result?.id).toBe(accountLinkSession.id);
		expect(result?.userId).toBe(accountLinkSession.userId);
		expect(result?.expiresAt.getTime()).toBe(accountLinkSession.expiresAt.getTime());
	});

	test("should return null when not found", async () => {
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
			},
		});

		const result = await accountLinkSessionRepository.findById(accountLinkSession.id);

		expect(result).toBeNull();
	});
});
