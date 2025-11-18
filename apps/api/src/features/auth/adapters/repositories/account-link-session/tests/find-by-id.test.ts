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

describe("AccountLinkSessionRepository.findById", () => {
	beforeEach(async () => {
		await accountLinkSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should return session from sessionId", async () => {
		const { session } = createAccountLinkSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await accountLinkSessionTableHelper.save(convertAccountLinkSessionToRaw(session));

		const foundSession = await accountLinkSessionRepository.findById(session.id);
		const expectedSession = convertAccountLinkSessionToRaw(session);

		expect(foundSession).toBeDefined();
		expect(expectedSession).toStrictEqual(convertAccountLinkSessionToRaw(foundSession!));
	});

	test("should return null if session not found", async () => {
		const foundSession = await accountLinkSessionRepository.findById(newAccountLinkSessionId("wrongSessionId"));
		expect(foundSession).toBeNull();
	});
});
