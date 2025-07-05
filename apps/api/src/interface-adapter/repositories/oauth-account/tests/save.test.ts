import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import type { OAuthAccount } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oauthAccountTableHelper = new OAuthAccountTableHelper(DB);

describe("OAuthAccountRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should set oauthAccount in the database", async () => {
		await oauthAccountRepository.save(oauthAccountTableHelper.baseData);

		const results = await oauthAccountTableHelper.findByProviderAndProviderId(
			oauthAccountTableHelper.baseData.provider,
			oauthAccountTableHelper.baseData.providerId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(oauthAccountTableHelper.baseDatabaseData);
	});

	test("should update oauthAccount in the database if it already exists", async () => {
		await oauthAccountTableHelper.create();

		const updatedOAuthAccount = {
			provider: oauthAccountTableHelper.baseData.provider,
			providerId: oauthAccountTableHelper.baseData.providerId,
			userId: oauthAccountTableHelper.baseData.userId,
			linkedAt: oauthAccountTableHelper.baseData.linkedAt,
		} satisfies OAuthAccount;

		await oauthAccountRepository.save(updatedOAuthAccount);

		const results = await oauthAccountTableHelper.findByProviderAndProviderId(
			oauthAccountTableHelper.baseData.provider,
			oauthAccountTableHelper.baseData.providerId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			provider: oauthAccountTableHelper.baseDatabaseData.provider,
			provider_id: oauthAccountTableHelper.baseDatabaseData.provider_id,
			user_id: oauthAccountTableHelper.baseDatabaseData.user_id,
			linked_at: oauthAccountTableHelper.baseDatabaseData.linked_at,
		});
	});
});
