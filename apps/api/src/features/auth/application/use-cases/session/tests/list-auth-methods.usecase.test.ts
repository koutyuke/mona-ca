import { assert, beforeEach, describe, expect, it } from "vitest";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import {
	ProviderAccountRepositoryMock,
	createProviderAccountKey,
	createProviderAccountsMap,
} from "../../../../testing/mocks/repositories";
import { ListAuthMethodsUseCase } from "../list-auth-methods.usecase";

const providerAccountMap = createProviderAccountsMap();

const providerAccountRepository = new ProviderAccountRepositoryMock({ providerAccountMap });

const listAuthMethodsUseCase = new ListAuthMethodsUseCase(providerAccountRepository);

const { userCredentials } = createAuthUserFixture();
const PROVIDER = newIdentityProviders("discord");
const PROVIDER_USER_ID = newIdentityProvidersUserId("discord_user_id");

describe("ListAuthMethodsUseCase", () => {
	beforeEach(() => {
		providerAccountMap.clear();
	});

	it("Success: should return password enabled and no federated connections for user with password only", async () => {
		const result = await listAuthMethodsUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { password, federated } = result.value;

		expect(password.enabled).toBe(true);
		expect(federated.discord).toBeNull();
		expect(federated.google).toBeNull();
	});

	it("Success: should return password enabled and federated connections for user with both password and provider account", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userCredentials.id,
				provider: PROVIDER,
				providerUserId: PROVIDER_USER_ID,
			},
		});

		providerAccountMap.set(createProviderAccountKey(PROVIDER, PROVIDER_USER_ID), providerAccount);

		const result = await listAuthMethodsUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { password, federated } = result.value;

		expect(password.enabled).toBe(true);
		expect(federated.discord).not.toBeNull();
		expect(federated.google).toBeNull();

		assert(federated.discord);
		expect(federated.discord.provider).toBe(PROVIDER);
		expect(federated.discord.providerUserId).toBe(PROVIDER_USER_ID);
		expect(federated.discord.linkedAt).toBeInstanceOf(Date);
		expect(federated.discord.linkedAt.getTime()).toBeLessThanOrEqual(Date.now());
	});
});
