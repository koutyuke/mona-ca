import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { OAuthAccount } from "../../../../models/entities/oauth-account";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oAuthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oAuthAccountTableHelper = new OAuthAccountTableHelper(DB);

describe("OAuthAccountRepository.findByProviderAndProviderId", () => {
	beforeAll(async () => {
		await userTableHelper.create();

		await oAuthAccountTableHelper.create();
	});

	test("should return OAuthAccount instance", async () => {
		const foundOAuthAccount = await oAuthAccountRepository.findByProviderAndProviderId(
			oAuthAccountTableHelper.baseOAuthAccount.provider,
			oAuthAccountTableHelper.baseOAuthAccount.providerId,
		);

		const expectedOAuthAccount = new OAuthAccount({
			...oAuthAccountTableHelper.baseOAuthAccount,
			createdAt: foundOAuthAccount!.createdAt,
			updatedAt: foundOAuthAccount!.updatedAt,
		});

		expect(foundOAuthAccount).toStrictEqual(expectedOAuthAccount);
	});

	test("should return null if OAuthAccount not found", async () => {
		const invalidOAuthAccount = await oAuthAccountRepository.findByProviderAndProviderId(
			"invalidProvider" as "discord",
			"invalidProviderId",
		);
		expect(invalidOAuthAccount).toBeNull();
	});
});
