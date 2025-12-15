import { assert, beforeEach, describe, expect, it } from "vitest";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import {
	ProviderAccountRepositoryMock,
	createProviderAccountKey,
	createProviderAccountsMap,
} from "../../../../testing/mocks/repositories";
import { ProviderLinkUnlinkUseCase } from "../unlink.usecase";

const providerAccountMap = createProviderAccountsMap();

const providerAccountRepository = new ProviderAccountRepositoryMock({ providerAccountMap });

const providerLinkUnlinkUseCase = new ProviderLinkUnlinkUseCase(providerAccountRepository);

const { userCredentials } = createAuthUserFixture();
const PROVIDER = newIdentityProviders("discord");
const PROVIDER_USER_ID = newIdentityProvidersUserId("discord_user_id");

describe("ProviderLinkUnlinkUseCase", () => {
	beforeEach(() => {
		providerAccountMap.clear();
	});

	it("Success: should unlink provider account when user has password and linked account", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userCredentials.id,
				provider: PROVIDER,
				providerUserId: PROVIDER_USER_ID,
			},
		});

		providerAccountMap.set(createProviderAccountKey(PROVIDER, PROVIDER_USER_ID), providerAccount);

		const result = await providerLinkUnlinkUseCase.execute(PROVIDER, userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// プロバイダーアカウントが削除されていること
		expect(providerAccountMap.has(createProviderAccountKey(PROVIDER, PROVIDER_USER_ID))).toBe(false);
		expect(providerAccountMap.size).toBe(0);
	});

	it("Error: should return PROVIDER_NOT_LINKED error when user has no linked account for provider", async () => {
		const result = await providerLinkUnlinkUseCase.execute(PROVIDER, userCredentials);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("PROVIDER_NOT_LINKED");
	});

	it("Error: should return PASSWORD_NOT_SET error when user has no password", async () => {
		const userWithoutPassword = {
			...userCredentials,
			passwordHash: null,
		};

		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userWithoutPassword.id,
				provider: PROVIDER,
				providerUserId: PROVIDER_USER_ID,
			},
		});

		providerAccountMap.set(createProviderAccountKey(PROVIDER, PROVIDER_USER_ID), providerAccount);

		const result = await providerLinkUnlinkUseCase.execute(PROVIDER, userWithoutPassword);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("PASSWORD_NOT_SET");

		// セキュリティ: パスワードがない場合、プロバイダーアカウントは削除されないこと（アカウントロックアウト防止）
		expect(providerAccountMap.has(createProviderAccountKey(PROVIDER, PROVIDER_USER_ID))).toBe(true);
	});
});
