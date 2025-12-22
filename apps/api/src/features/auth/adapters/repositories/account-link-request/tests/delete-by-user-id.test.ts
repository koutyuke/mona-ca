import { env } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountLinkRequestsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertAccountLinkRequestToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAccountLinkRequestFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { AccountLinkRequestRepository } from "../account-link-request.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountLinkRequestRepository = new AccountLinkRequestRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const accountLinkRequestTableDriver = new AccountLinkRequestsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkRequestRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterEach(async () => {
		await accountLinkRequestTableDriver.deleteAll();
		await userTableDriver.deleteAll();
	});

	test("should delete all requests for a user", async () => {
		const { accountLinkRequest: request1 } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
			},
		});
		await accountLinkRequestTableDriver.save(convertAccountLinkRequestToRaw(request1));

		await accountLinkRequestRepository.deleteByUserId(userRegistration.id);

		const results = await accountLinkRequestTableDriver.findByUserId(userRegistration.id);

		expect(results.length).toBe(0);
	});

	test("should not throw error when deleting non-existent user", async () => {
		const { accountLinkRequest: request1 } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
			},
		});
		await accountLinkRequestTableDriver.save(convertAccountLinkRequestToRaw(request1));

		const nonExistentUserId = newUserId("nonExistentUserId");

		await expect(accountLinkRequestRepository.deleteByUserId(nonExistentUserId)).resolves.not.toThrow();

		const results = await accountLinkRequestTableDriver.findByUserId(userRegistration.id);

		expect(results.length).toBe(1);
	});
});
