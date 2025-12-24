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

const { accountLinkRequest: request } = createAccountLinkRequestFixture({
	accountLinkRequest: {
		userId: userRegistration.id,
	},
});

describe("AccountLinkRequestRepository.findById", () => {
	beforeEach(async () => {
		await accountLinkRequestTableDriver.deleteAll();
		await userTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should find data in database", async () => {
		await accountLinkRequestTableDriver.save(convertAccountLinkRequestToRaw(request));

		const result = await accountLinkRequestRepository.findById(request.id);

		expect(result).not.toBeNull();
		expect(result?.id).toBe(request.id);
		expect(result?.userId).toBe(request.userId);
		expect(result?.email).toBe(request.email);
		expect(result?.provider).toBe(request.provider);
		expect(result?.providerUserId).toBe(request.providerUserId);
		expect(result?.expiresAt.getTime()).toBe(request.expiresAt.getTime());
	});

	test("should return null when not found", async () => {
		const result = await accountLinkRequestRepository.findById(request.id);

		expect(result).toBeNull();
	});
});
