import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import type { OAuthAccount } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { OAuthAccountTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { toDatabaseDate } from "../../../../tests/utils";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oauthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oauthAccountTableHelper = new OAuthAccountTableHelper(DB);

const now = new Date();

describe("OAuthAccountRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should set oauthAccount in the database", async () => {
		await oauthAccountRepository.save(oauthAccountTableHelper.baseOAuthAccount);

		const results = await oauthAccountTableHelper.findByProviderAndProviderId(
			oauthAccountTableHelper.baseOAuthAccount.provider,
			oauthAccountTableHelper.baseOAuthAccount.providerId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(oauthAccountTableHelper.baseDatabaseOAuthAccount);
	});

	test("should update oauthAccount in the database if it already exists", async () => {
		await oauthAccountTableHelper.create();

		const updatedOAuthAccount = {
			provider: oauthAccountTableHelper.baseOAuthAccount.provider,
			providerId: oauthAccountTableHelper.baseOAuthAccount.providerId,
			userId: oauthAccountTableHelper.baseOAuthAccount.userId,
			linkedAt: oauthAccountTableHelper.baseOAuthAccount.linkedAt,
		} satisfies OAuthAccount;

		await oauthAccountRepository.save(updatedOAuthAccount);

		const results = await oauthAccountTableHelper.findByProviderAndProviderId(
			oauthAccountTableHelper.baseOAuthAccount.provider,
			oauthAccountTableHelper.baseOAuthAccount.providerId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			provider: oauthAccountTableHelper.baseDatabaseOAuthAccount.provider,
			provider_id: oauthAccountTableHelper.baseDatabaseOAuthAccount.provider_id,
			user_id: oauthAccountTableHelper.baseDatabaseOAuthAccount.user_id,
			created_at: oauthAccountTableHelper.baseDatabaseOAuthAccount.created_at,
			updated_at: toDatabaseDate(now),
		});
	});
});
