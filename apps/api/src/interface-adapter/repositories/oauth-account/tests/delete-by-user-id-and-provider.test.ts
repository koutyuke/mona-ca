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

describe("OAuthAccountRepository.deleteByUserIdAndProvider", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await oauthAccountTableHelper.create();
	});

	test("should delete date in database", async () => {
		await oauthAccountRepository.deleteByUserIdAndProvider(
			oauthAccountTableHelper.baseOAuthAccount.userId,
			oauthAccountTableHelper.baseOAuthAccount.provider,
		);
		const results = await oauthAccountTableHelper.findByUserIdAndProvider(
			oauthAccountTableHelper.baseOAuthAccount.userId,
			oauthAccountTableHelper.baseOAuthAccount.provider,
		);
		expect(results).toHaveLength(0);
	});
});
