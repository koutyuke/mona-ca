import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderAccountsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertProviderAccountToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { ProviderAccountRepository } from "../provider-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerAccountRepository = new ProviderAccountRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const providerAccountTableDriver = new ProviderAccountsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderAccountRepository.deleteByUserIdAndProvider", () => {
	beforeEach(async () => {
		await providerAccountTableDriver.deleteAll();
	});

	beforeAll(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableDriver.deleteAll();
		await providerAccountTableDriver.deleteAll();
	});

	test("should delete date in database", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userRegistration.id,
			},
		});
		await providerAccountTableDriver.save(convertProviderAccountToRaw(providerAccount));

		await providerAccountRepository.deleteByUserIdAndProvider(providerAccount.userId, providerAccount.provider);
		const results = await providerAccountTableDriver.findByUserIdAndProvider(
			providerAccount.userId,
			providerAccount.provider,
		);
		expect(results).toHaveLength(0);
	});
});
