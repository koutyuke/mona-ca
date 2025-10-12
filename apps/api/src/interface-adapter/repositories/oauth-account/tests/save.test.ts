import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { OAuthAccount } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createOAuthAccountFixture, createUserFixture } from "../../../../tests/fixtures";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oauthAccountTableHelper = new OAuthAccountTableHelper(DB);

const { user } = createUserFixture();

describe("OAuthAccountRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM oauth_accounts");
	});

	test("should set oauthAccount in the database", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
			},
		});

		await oauthAccountRepository.save(oauthAccount);

		const results = await oauthAccountTableHelper.findByProviderAndProviderId(
			oauthAccount.provider,
			oauthAccount.providerId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(oauthAccountTableHelper.convertToRaw(oauthAccount));
	});

	test("should update oauthAccount in the database if it already exists", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
			},
		});
		await oauthAccountTableHelper.save(oauthAccount);

		const updatedOAuthAccount = {
			...oauthAccount,
			linkedAt: new Date("2024-01-01T00:00:00.000Z"),
		} satisfies OAuthAccount;

		await oauthAccountRepository.save(updatedOAuthAccount);

		const results = await oauthAccountTableHelper.findByProviderAndProviderId(
			oauthAccount.provider,
			oauthAccount.providerId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(oauthAccountTableHelper.convertToRaw(updatedOAuthAccount));
	});
});
