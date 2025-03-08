import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oauthAccountTableHelper = new OAuthAccountTableHelper(DB);

describe("OAuthAccountRepository.deleteByProviderAndProviderId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await oauthAccountTableHelper.create();
	});

	test("should delete date in database", async () => {
		await oauthAccountRepository.deleteByProviderAndProviderId(
			oauthAccountTableHelper.baseOAuthAccount.provider,
			oauthAccountTableHelper.baseOAuthAccount.providerId,
		);
		const results = await oauthAccountTableHelper.findByProviderAndProviderId(
			oauthAccountTableHelper.baseOAuthAccount.provider,
			oauthAccountTableHelper.baseOAuthAccount.providerId,
		);
		expect(results).toHaveLength(0);
	});
});
