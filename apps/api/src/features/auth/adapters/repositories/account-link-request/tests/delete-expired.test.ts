import { env } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
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
const { userRegistration: userRegistration2 } = createAuthUserFixture({
	userRegistration: {
		email: "user2@example.com",
	},
});

describe("AccountLinkRequestRepository.deleteExpiredRequests", () => {
	beforeEach(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration2));
	});

	afterEach(async () => {
		await accountLinkRequestTableDriver.deleteAll();
		await userTableDriver.deleteAll();
	});

	test("should delete expired requests", async () => {
		const expiredDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
		const validDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

		const { accountLinkRequest: expiredRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				expiresAt: expiredDate,
			},
		});

		const { accountLinkRequest: validRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration2.id,
				expiresAt: validDate,
			},
		});

		await accountLinkRequestTableDriver.save(convertAccountLinkRequestToRaw(expiredRequest));
		await accountLinkRequestTableDriver.save(convertAccountLinkRequestToRaw(validRequest));

		await accountLinkRequestRepository.deleteExpiredRequests();

		const expiredResults = await accountLinkRequestTableDriver.findById(expiredRequest.id);
		const validResults = await accountLinkRequestTableDriver.findById(validRequest.id);

		expect(expiredResults.length).toBe(0);
		expect(validResults.length).toBe(1);
		expect(validResults[0]).toStrictEqual(convertAccountLinkRequestToRaw(validRequest));
	});
});
