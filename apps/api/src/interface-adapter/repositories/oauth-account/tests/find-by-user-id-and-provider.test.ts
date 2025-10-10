import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newOAuthProvider, newUserId } from "../../../../domain/value-object";
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

describe("OAuthAccountRepository.findByUserIdAndProvider", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM oauth_accounts");
	});

	test("should return OAuthAccount instance", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
			},
		});
		await oauthAccountTableHelper.save(oauthAccount);

		const foundOAuthAccount = await oauthAccountRepository.findByUserIdAndProvider(
			oauthAccount.userId,
			oauthAccount.provider,
		);

		expect(foundOAuthAccount).not.toBeNull();
		expect(oauthAccountTableHelper.convertToRaw(foundOAuthAccount!)).toStrictEqual(
			oauthAccountTableHelper.convertToRaw(oauthAccount),
		);
	});

	test("should return null if OAuthAccount not found", async () => {
		const invalidOAuthAccount = await oauthAccountRepository.findByUserIdAndProvider(
			newUserId("invalidId"),
			newOAuthProvider("discord"),
		);
		expect(invalidOAuthAccount).toBeNull();
	});
});
