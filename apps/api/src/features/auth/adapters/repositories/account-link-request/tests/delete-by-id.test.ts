import { env } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountLinkRequestsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newAccountLinkRequestId } from "../../../../domain/value-objects/ids";
import { convertAccountLinkRequestToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAccountLinkRequestFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { AccountLinkRequestRepository } from "../account-link-request.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountLinkRequestRepository = new AccountLinkRequestRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const accountLinkRequestTableDriver = new AccountLinkRequestsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

const { accountLinkRequest: request } = createAccountLinkRequestFixture({
	accountLinkRequest: {
		userId: userRegistration.id,
	},
});

describe("AccountLinkRequestRepository.deleteById", () => {
	beforeEach(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterEach(async () => {
		await accountLinkRequestTableDriver.deleteAll();
		await userTableDriver.deleteAll();
	});

	test("should delete data in database", async () => {
		await accountLinkRequestTableDriver.save(convertAccountLinkRequestToRaw(request));

		await accountLinkRequestRepository.deleteById(request.id);

		const results = await accountLinkRequestTableDriver.findById(request.id);

		expect(results.length).toBe(0);
	});

	test("should not throw error when deleting non-existent proposal", async () => {
		const nonExistentRequestId = newAccountLinkRequestId("nonExistentRequestId");

		await expect(accountLinkRequestRepository.deleteById(nonExistentRequestId)).resolves.not.toThrow();
	});
});
