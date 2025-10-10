import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createOAuthAccountFixture, createUserFixture } from "../../../../tests/fixtures";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oauthAccountTableHelper = new OAuthAccountTableHelper(DB);

const { user, passwordHash } = createUserFixture();

describe("OAuthAccountRepository.deleteByUserIdAndProvider", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM oauth_accounts");
	});

	test("should delete date in database", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
			},
		});
		await oauthAccountTableHelper.save(oauthAccount);

		await oauthAccountRepository.deleteByUserIdAndProvider(oauthAccount.userId, oauthAccount.provider);
		const results = await oauthAccountTableHelper.findByUserIdAndProvider(oauthAccount.userId, oauthAccount.provider);
		expect(results).toHaveLength(0);
	});
});
