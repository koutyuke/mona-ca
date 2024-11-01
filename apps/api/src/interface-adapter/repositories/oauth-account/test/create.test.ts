import { env } from "cloudflare:test";
import { OAuthAccount } from "@/domain/oauth-account";
import { DrizzleService } from "@/infrastructure/drizzle";
import { OAuthAccountTableHelper, UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const oAuthAccountRepository = new OAuthAccountRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const oAuthAccountTableHelper = new OAuthAccountTableHelper(DB);

describe("OAuthAccountRepository.create", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should return OAuthAccount instance", async () => {
		const createdOAuthAccount = await oAuthAccountRepository.create(oAuthAccountTableHelper.baseOAuthAccount);

		const expectedOAuthAccount = new OAuthAccount({
			...oAuthAccountTableHelper.baseOAuthAccount,
			createdAt: createdOAuthAccount.createdAt,
			updatedAt: createdOAuthAccount.updatedAt,
		});

		expect(createdOAuthAccount).toStrictEqual(expectedOAuthAccount);
	});

	test("should set oAuthAccount in the database", async () => {
		await oAuthAccountRepository.create(oAuthAccountTableHelper.baseOAuthAccount);

		const results = await oAuthAccountTableHelper.find(oAuthAccountTableHelper.baseOAuthAccount.providerId);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			...oAuthAccountTableHelper.baseDatabaseOAuthAccount,
			created_at: results[0]!.created_at,
			updated_at: results[0]!.updated_at,
		});
	});
});
