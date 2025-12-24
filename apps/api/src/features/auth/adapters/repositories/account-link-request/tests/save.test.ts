import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
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

describe("AccountLinkRequestRepository.save", () => {
	beforeEach(async () => {
		await accountLinkRequestTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create a new request in the database", async () => {
		const { accountLinkRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
			},
		});
		await accountLinkRequestRepository.save(accountLinkRequest);

		const databaseRequests = await accountLinkRequestTableDriver.findById(accountLinkRequest.id);

		expect(databaseRequests.length).toBe(1);
		expect(databaseRequests[0]).toStrictEqual(convertAccountLinkRequestToRaw(accountLinkRequest));
	});
});
