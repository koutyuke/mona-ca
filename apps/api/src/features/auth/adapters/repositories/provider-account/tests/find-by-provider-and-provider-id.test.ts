import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderAccountsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import type { IdentityProviders } from "../../../../domain/value-objects/identity-providers";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { convertProviderAccountToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { ProviderAccountRepository } from "../provider-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerAccountRepository = new ProviderAccountRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const providerAccountTableDriver = new ProviderAccountsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderAccountRepository.findByProviderAndProviderId", () => {
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

		const foundProviderAccount = await providerAccountRepository.findByProviderAndProviderUserId(
			providerAccount.provider,
			providerAccount.providerUserId,
		);

		expect(foundProviderAccount).not.toBeNull();
		expect(convertProviderAccountToRaw(foundProviderAccount!)).toStrictEqual(
			convertProviderAccountToRaw(providerAccount),
		);
	});

	test("should return null if ProviderAccount not found", async () => {
		const invalidProviderAccount = await providerAccountRepository.findByProviderAndProviderUserId(
			newIdentityProviders("invalidProvider" as IdentityProviders),
			newIdentityProvidersUserId("invalidProviderId"),
		);
		expect(invalidProviderAccount).toBeNull();
	});
});
