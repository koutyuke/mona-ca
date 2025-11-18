import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderAccountsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { convertProviderAccountToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { ProviderAccountRepository } from "../provider-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerAccountRepository = new ProviderAccountRepository(drizzleService);

const userTableHelper = new UsersTableDriver(DB);
const providerAccountTableHelper = new ProviderAccountsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderAccountRepository.deleteByUserIdAndProvider", () => {
	beforeEach(async () => {
		await providerAccountTableHelper.deleteAll();
	});

	beforeAll(async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableHelper.deleteAll();
		await providerAccountTableHelper.deleteAll();
	});

	test("should delete date in database", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userRegistration.id,
			},
		});
		await providerAccountTableHelper.save(convertProviderAccountToRaw(providerAccount));

		await providerAccountRepository.deleteByUserIdAndProvider(providerAccount.userId, providerAccount.provider);
		const results = await providerAccountTableHelper.findByUserIdAndProvider(
			providerAccount.userId,
			providerAccount.provider,
		);
		expect(results).toHaveLength(0);
	});
});
