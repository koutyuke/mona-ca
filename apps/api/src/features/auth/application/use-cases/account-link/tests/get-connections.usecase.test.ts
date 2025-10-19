import { beforeEach, describe, expect, it } from "vitest";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../domain/value-objects/external-identity";
import { createAuthUserFixture, createExternalIdentityFixture } from "../../../../testing/fixtures";
import {
	ExternalIdentityRepositoryMock,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
} from "../../../../testing/mocks/repositories";
import type { IGetConnectionsUseCase } from "../../../contracts/account-link/get-connections.usecase.interface";
import { GetConnectionsUseCase } from "../get-connections.usecase";

const externalIdentityMap = createExternalIdentitiesMap();

const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap: externalIdentityMap });

const getConnectionsUseCase: IGetConnectionsUseCase = new GetConnectionsUseCase(externalIdentityRepository);

const { userIdentity } = createAuthUserFixture();
const provider = newExternalIdentityProvider("discord");
const providerUserId = newExternalIdentityProviderUserId("discord_user_id");

describe("GetConnectionsUseCase", () => {
	beforeEach(() => {
		externalIdentityMap.clear();
	});

	it("should return connections with password and no external identity connections for user with password only", async () => {
		const result = await getConnectionsUseCase.execute(userIdentity);

		const { password, discord } = result;

		expect(password).toBe(true);
		expect(discord).toBeNull();
	});

	it("should return connections with no password and no external identity connections for external identity-only user", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userIdentity.id,
				provider,
				providerUserId: providerUserId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await getConnectionsUseCase.execute(userIdentity);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerUserId).toBe(providerUserId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});

	it("should return connections with multiple external identity connections", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userIdentity.id,
				provider,
				providerUserId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await getConnectionsUseCase.execute(userIdentity);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerUserId).toBe(providerUserId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});

	it("should return connections for user with password and external identity connection", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userIdentity.id,
				provider,
				providerUserId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await getConnectionsUseCase.execute(userIdentity);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerUserId).toBe(providerUserId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});
});
