import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderAccountsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newIdentityProviders } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { convertProviderAccountToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { ProviderAccountRepository } from "../provider-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerAccountRepository = new ProviderAccountRepository(drizzleService);

const userTableHelper = new UsersTableDriver(DB);
const providerAccountTableHelper = new ProviderAccountsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderAccountRepository.findByUserIdAndProvider", () => {
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

	test("should return ProviderAccount instance", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userRegistration.id,
			},
		});
		await providerAccountTableHelper.save(convertProviderAccountToRaw(providerAccount));

		const foundProviderAccount = await providerAccountRepository.findByUserIdAndProvider(
			providerAccount.userId,
			providerAccount.provider,
		);

		expect(foundProviderAccount).not.toBeNull();
		expect(convertProviderAccountToRaw(foundProviderAccount!)).toStrictEqual(
			convertProviderAccountToRaw(providerAccount),
		);
	});

	test("should return null if ProviderAccount not found", async () => {
		const invalidProviderAccount = await providerAccountRepository.findByUserIdAndProvider(
			newUserId("invalidId"),
			newIdentityProviders("discord"),
		);
		expect(invalidProviderAccount).toBeNull();
	});
});
