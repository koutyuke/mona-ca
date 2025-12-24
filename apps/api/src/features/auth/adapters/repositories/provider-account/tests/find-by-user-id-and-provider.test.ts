import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderAccountsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newIdentityProviders } from "../../../../domain/value-objects/identity-providers";
import { convertProviderAccountToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { ProviderAccountRepository } from "../provider-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerAccountRepository = new ProviderAccountRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const providerAccountTableDriver = new ProviderAccountsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderAccountRepository.findByUserIdAndProvider", () => {
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

	test("should return ProviderAccount instance", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userRegistration.id,
			},
		});
		await providerAccountTableDriver.save(convertProviderAccountToRaw(providerAccount));

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
