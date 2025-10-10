import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oauthAccountTableHelper = new OAuthAccountTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("OAuthAccountRepository.deleteByProviderAndProviderId", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM oauth_accounts");
	});

	test("should delete date in database", async () => {
		const { oauthAccount } = oauthAccountTableHelper.createData({
			oauthAccount: {
				userId: user.id,
			},
		});
		await oauthAccountTableHelper.save(oauthAccount);

		await oauthAccountRepository.deleteByProviderAndProviderId(oauthAccount.provider, oauthAccount.providerId);
		const results = await oauthAccountTableHelper.findByProviderAndProviderId(
			oauthAccount.provider,
			oauthAccount.providerId,
		);
		expect(results).toHaveLength(0);
	});
});
