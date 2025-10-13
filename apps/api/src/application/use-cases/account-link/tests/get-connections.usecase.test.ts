import { beforeEach, describe, expect, it } from "vitest";
import { newExternalIdentityProvider, newExternalIdentityProviderUserId } from "../../../../domain/value-object";
import { createExternalIdentityFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	ExternalIdentityRepositoryMock,
	PasswordHasherMock,
	UserRepositoryMock,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import type { IGetConnectionsUseCase } from "../../../ports/in";
import { GetConnectionsUseCase } from "../get-connections.usecase";

const sessionMap = createSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const externalIdentityMap = createExternalIdentitiesMap();

const passwordHasher = new PasswordHasherMock();

const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap: externalIdentityMap });

const getConnectionsUseCase: IGetConnectionsUseCase = new GetConnectionsUseCase(
	externalIdentityRepository,
	userRepository,
);

const { user } = createUserFixture();
const password = "password123";
const passwordHash = await passwordHasher.hash(password);
const provider = newExternalIdentityProvider("discord");
const providerUserId = newExternalIdentityProviderUserId("discord_user_id");

describe("GetConnectionsUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();
		externalIdentityMap.clear();

		userMap.set(user.id, user);
		if (passwordHash) {
			userPasswordHashMap.set(user.id, passwordHash);
		}
	});

	it("should return connections with password and no external identity connections for user with password only", async () => {
		const result = await getConnectionsUseCase.execute(user.id);

		expect(result.password).toBe(true);
		expect(result.discord).toBeNull();
	});

	it("should return connections with no password and no external identity connections for external identity-only user", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
				provider,
				providerUserId: providerUserId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await getConnectionsUseCase.execute(user.id);

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
				userId: user.id,
				provider,
				providerUserId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await getConnectionsUseCase.execute(user.id);

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
				userId: user.id,
				provider,
				providerUserId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await getConnectionsUseCase.execute(user.id);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerUserId).toBe(providerUserId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});
});
