import { beforeEach, describe, expect, it } from "vitest";
import { newOAuthProvider, newOAuthProviderId } from "../../../../domain/value-object";
import { createOAuthAccountFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	OAuthAccountRepositoryMock,
	UserRepositoryMock,
	createOAuthAccountKey,
	createOAuthAccountsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import type { IGetConnectionsUseCase } from "../../../ports/in";
import { GetConnectionsUseCase } from "../get-connections.usecase";

describe("GetConnectionsUseCase", () => {
	const sessionMap = createSessionsMap();
	const userMap = createUsersMap();
	const userPasswordHashMap = createUserPasswordHashMap();
	const oauthAccountMap = createOAuthAccountsMap();

	const userRepositoryMock = new UserRepositoryMock({
		userMap,
		userPasswordHashMap,
		sessionMap,
	});
	const oauthAccountRepositoryMock = new OAuthAccountRepositoryMock({ oauthAccountMap });
	const getConnectionsUseCase: IGetConnectionsUseCase = new GetConnectionsUseCase(
		oauthAccountRepositoryMock,
		userRepositoryMock,
	);

	const { user, passwordHash } = createUserFixture();
	const provider = newOAuthProvider("discord");
	const providerId = newOAuthProviderId("discord_user_id");

	beforeEach(() => {
		sessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();
		oauthAccountMap.clear();

		userMap.set(user.id, user);
		if (passwordHash) {
			userPasswordHashMap.set(user.id, passwordHash);
		}
	});

	it("should return connections with password and no oauth connections for user with password only", async () => {
		const result = await getConnectionsUseCase.execute(user.id);

		expect(result.password).toBe(true);
		expect(result.discord).toBeNull();
	});

	it("should return connections with no password and no oauth connections for oauth-only user", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
				provider,
				providerId,
			},
		});

		oauthAccountMap.set(createOAuthAccountKey(provider, providerId), oauthAccount);

		const result = await getConnectionsUseCase.execute(user.id);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerId).toBe(providerId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});

	it("should return connections with multiple oauth connections", async () => {
		const { oauthAccount: discordAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
				provider,
				providerId,
			},
		});

		oauthAccountMap.set(createOAuthAccountKey(provider, providerId), discordAccount);

		const result = await getConnectionsUseCase.execute(user.id);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerId).toBe(providerId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});

	it("should return connections for user with password and oauth connection", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
				provider,
				providerId,
			},
		});

		oauthAccountMap.set(createOAuthAccountKey(provider, providerId), oauthAccount);

		const result = await getConnectionsUseCase.execute(user.id);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerId).toBe(providerId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});
});
