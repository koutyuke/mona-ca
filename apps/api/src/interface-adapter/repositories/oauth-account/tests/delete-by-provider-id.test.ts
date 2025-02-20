import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oAuthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oAuthAccountTableHelper = new OAuthAccountTableHelper(DB);

describe("OAuthAccountRepository.deleteByProviderId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await oAuthAccountTableHelper.create();
	});

	test("should delete date in database", async () => {
		await oAuthAccountRepository.deleteByProviderAndProviderId(
			oAuthAccountTableHelper.baseOAuthAccount.provider,
			oAuthAccountTableHelper.baseOAuthAccount.providerId,
		);
		const results = await oAuthAccountTableHelper.find(oAuthAccountTableHelper.baseOAuthAccount.providerId);
		expect(results).toHaveLength(0);
	});
});
