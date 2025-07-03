import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { newOAuthProvider, newOAuthProviderId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oauthAccountTableHelper = new OAuthAccountTableHelper(DB);

describe("OAuthAccountRepository.findByProviderAndProviderId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await oauthAccountTableHelper.create();
	});

	test("should return OAuthAccount instance", async () => {
		const foundOAuthAccount = await oauthAccountRepository.findByProviderAndProviderId(
			oauthAccountTableHelper.baseData.provider,
			oauthAccountTableHelper.baseData.providerId,
		);

		expect(foundOAuthAccount).toStrictEqual(oauthAccountTableHelper.baseData);
	});

	test("should return null if OAuthAccount not found", async () => {
		const invalidOAuthAccount = await oauthAccountRepository.findByProviderAndProviderId(
			newOAuthProvider("invalidProvider" as "discord"),
			newOAuthProviderId("invalidProviderId"),
		);
		expect(invalidOAuthAccount).toBeNull();
	});
});
