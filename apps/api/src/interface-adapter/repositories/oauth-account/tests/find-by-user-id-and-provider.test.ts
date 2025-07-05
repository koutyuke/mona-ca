import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oauthAccountTableHelper = new OAuthAccountTableHelper(DB);

describe("OAuthAccountRepository.findByUserIdAndProvider", () => {
	beforeAll(async () => {
		await userTableHelper.create();

		await oauthAccountTableHelper.create();
	});

	test("should return OAuthAccount instance", async () => {
		const foundOAuthAccount = await oauthAccountRepository.findByUserIdAndProvider(
			oauthAccountTableHelper.baseData.userId,
			oauthAccountTableHelper.baseData.provider,
		);

		expect(foundOAuthAccount).toStrictEqual(oauthAccountTableHelper.baseData);
	});

	test("should return null if OAuthAccount not found", async () => {
		const invalidOAuthAccount = await oauthAccountRepository.findByUserIdAndProvider(
			newUserId("invalidId"),
			oauthAccountTableHelper.baseData.provider,
		);
		expect(invalidOAuthAccount).toBeNull();
	});
});
