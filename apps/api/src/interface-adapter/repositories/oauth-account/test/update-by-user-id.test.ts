import { env } from "cloudflare:test";
import { OAuthAccount } from "@/domain/oauth-account";
import { DrizzleService } from "@/infrastructure/drizzle";
import { type DatabaseOAuthAccount, OAuthAccountTableHelper, UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oAuthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oAuthAccountTableHelper = new OAuthAccountTableHelper(DB);

describe("OAuthAccountRepository.updateByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await oAuthAccountTableHelper.create();
	});

	test("should update oAuthAccount instance", async () => {
		const updatedOAuthAccount = await oAuthAccountRepository.updateByUserId(
			oAuthAccountTableHelper.baseOAuthAccount.userId,
			{
				provider: "discord",
				providerId: "updatedDiscordId",
			},
		);

		const expectedOAuthAccount = new OAuthAccount({
			...oAuthAccountTableHelper.baseOAuthAccount,
			provider: "discord",
			providerId: "updatedDiscordId",
			createdAt: updatedOAuthAccount.createdAt,
			updatedAt: updatedOAuthAccount.updatedAt,
		});

		expect(updatedOAuthAccount).toStrictEqual(expectedOAuthAccount);
	});

	test("should update oAuthAccount in the database", async () => {
		await oAuthAccountRepository.updateByUserId(oAuthAccountTableHelper.baseOAuthAccount.userId, {
			provider: "discord",
			providerId: "updatedDiscordId",
		});

		const results = await oAuthAccountTableHelper.find("updatedDiscordId");

		const expectedDatabaseOAuthAccount = {
			...oAuthAccountTableHelper.baseDatabaseOAuthAccount,
			provider: "discord",
			provider_id: "updatedDiscordId",
			updated_at: results[0]!.updated_at,
		} satisfies DatabaseOAuthAccount;

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(expectedDatabaseOAuthAccount);
	});
});
