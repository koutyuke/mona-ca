import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderAccountsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import type { ProviderAccount } from "../../../../domain/entities/provider-account";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { convertProviderAccountToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { ProviderAccountRepository } from "../provider-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerAccountRepository = new ProviderAccountRepository(drizzleService);

const userTableHelper = new UsersTableDriver(DB);
const providerAccountTableHelper = new ProviderAccountsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderAccountRepository.save", () => {
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

	test("should set providerAccount in the database", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userRegistration.id,
			},
		});

		await providerAccountRepository.save(providerAccount);

		const results = await providerAccountTableHelper.findByProviderAndProviderUserId(
			providerAccount.provider,
			providerAccount.providerUserId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertProviderAccountToRaw(providerAccount));
	});

	test("should update providerAccount in the database if it already exists", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userRegistration.id,
			},
		});
		await providerAccountTableHelper.save(convertProviderAccountToRaw(providerAccount));

		const updatedProviderAccount = {
			...providerAccount,
			linkedAt: new Date("2024-01-01T00:00:00.000Z"),
		} satisfies ProviderAccount;

		await providerAccountRepository.save(updatedProviderAccount);

		const results = await providerAccountTableHelper.findByProviderAndProviderUserId(
			providerAccount.provider,
			providerAccount.providerUserId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertProviderAccountToRaw(updatedProviderAccount));
	});
});
