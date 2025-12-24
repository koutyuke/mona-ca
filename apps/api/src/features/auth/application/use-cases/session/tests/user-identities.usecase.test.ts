import { assert, beforeEach, describe, expect, it } from "vitest";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import {
	ProviderAccountRepositoryMock,
	createProviderAccountKey,
	createProviderAccountMap,
} from "../../../../testing/mocks/repositories";
import { UserIdentitiesUseCase } from "../user-identities.usecase";

const providerAccountMap = createProviderAccountMap();

const providerAccountRepository = new ProviderAccountRepositoryMock({ providerAccountMap });

const userIdentitiesUseCase = new UserIdentitiesUseCase(providerAccountRepository);

const { userCredentials } = createAuthUserFixture();
const DISCORD_PROVIDER = newIdentityProviders("discord");
const DISCORD_PROVIDER_USER_ID = newIdentityProvidersUserId("discord_user_id");
const GOOGLE_PROVIDER = newIdentityProviders("google");
const GOOGLE_PROVIDER_USER_ID = newIdentityProvidersUserId("google_user_id");

describe("UserIdentitiesUseCase", () => {
	beforeEach(() => {
		providerAccountMap.clear();
	});

	it("Success: should return password enabled and empty federated array for user with password only", async () => {
		const result = await userIdentitiesUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { password, federated } = result.value;

		expect(password.enabled).toBe(true);
		expect(federated).toEqual([]);
	});

	it("Success: should return password enabled and federated array with Discord for user with both password and Discord provider account", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userCredentials.id,
				provider: DISCORD_PROVIDER,
				providerUserId: DISCORD_PROVIDER_USER_ID,
			},
		});

		providerAccountMap.set(createProviderAccountKey(DISCORD_PROVIDER, DISCORD_PROVIDER_USER_ID), providerAccount);

		const result = await userIdentitiesUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { password, federated } = result.value;

		expect(password.enabled).toBe(true);
		expect(federated).toHaveLength(1);
		assert(federated[0]);
		expect(federated[0].provider).toBe(DISCORD_PROVIDER);
		expect(federated[0].providerUserId).toBe(DISCORD_PROVIDER_USER_ID);
		expect(federated[0].linkedAt).toBeInstanceOf(Date);
		expect(federated[0].linkedAt.getTime()).toBeLessThanOrEqual(Date.now());
	});

	it("Success: should return federated array sorted by Google first, then Discord", async () => {
		const { providerAccount: discordAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userCredentials.id,
				provider: DISCORD_PROVIDER,
				providerUserId: DISCORD_PROVIDER_USER_ID,
			},
		});

		const { providerAccount: googleAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userCredentials.id,
				provider: GOOGLE_PROVIDER,
				providerUserId: GOOGLE_PROVIDER_USER_ID,
			},
		});

		providerAccountMap.set(createProviderAccountKey(DISCORD_PROVIDER, DISCORD_PROVIDER_USER_ID), discordAccount);
		providerAccountMap.set(createProviderAccountKey(GOOGLE_PROVIDER, GOOGLE_PROVIDER_USER_ID), googleAccount);

		const result = await userIdentitiesUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { password, federated } = result.value;

		expect(password.enabled).toBe(true);
		expect(federated).toHaveLength(2);

		assert(federated[0]);
		assert(federated[1]);

		expect(federated[0].provider).toBe(GOOGLE_PROVIDER);
		expect(federated[0].providerUserId).toBe(GOOGLE_PROVIDER_USER_ID);
		expect(federated[1].provider).toBe(DISCORD_PROVIDER);
		expect(federated[1].providerUserId).toBe(DISCORD_PROVIDER_USER_ID);
	});

	it("Success: should return password disabled when user has no password hash", async () => {
		const { userCredentials: noPasswordUser } = createAuthUserFixture({
			userCredentials: { passwordHash: null },
		});

		const result = await userIdentitiesUseCase.execute(noPasswordUser);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { password, federated } = result.value;

		expect(password.enabled).toBe(false);
		expect(federated).toEqual([]);
	});
});
