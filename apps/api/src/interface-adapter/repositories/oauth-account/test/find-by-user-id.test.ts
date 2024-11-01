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

describe("OAuthAccountRepository.findByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.create();

		await oAuthAccountTableHelper.create();
	});

	test("should return OAuthAccount instance", async () => {
		const foundOAuthAccount = await oAuthAccountRepository.findByUserId(
			oAuthAccountTableHelper.baseOAuthAccount.userId,
		);

		const expectedOAuthAccount = new OAuthAccount({
			...oAuthAccountTableHelper.baseOAuthAccount,
			createdAt: foundOAuthAccount!.createdAt,
			updatedAt: foundOAuthAccount!.updatedAt,
		});

		expect(foundOAuthAccount).toStrictEqual(expectedOAuthAccount);
	});

	test("should return null if OAuthAccount not found", async () => {
		const invalidOAuthAccount = await oAuthAccountRepository.findByUserId("invalidId");
		expect(invalidOAuthAccount).toBeNull();
	});
});
