import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderLinkRequestsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertProviderLinkRequestToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createProviderLinkRequestFixture } from "../../../../testing/fixtures";
import { ProviderLinkRequestRepository } from "../provider-link-request.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerLinkRequestRepository = new ProviderLinkRequestRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const providerLinkRequestTableDriver = new ProviderLinkRequestsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderLinkRequestRepository.save", () => {
	beforeEach(async () => {
		await providerLinkRequestTableDriver.deleteAll();
		await userTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create data in database", async () => {
		const { providerLinkRequest: request } = createProviderLinkRequestFixture({
			providerLinkRequest: {
				userId: userRegistration.id,
			},
		});

		await providerLinkRequestRepository.save(request);

		const results = await providerLinkRequestTableDriver.findById(request.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertProviderLinkRequestToRaw(request));
	});
});
