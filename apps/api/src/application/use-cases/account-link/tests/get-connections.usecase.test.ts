import { beforeEach, describe, expect, it } from "vitest";
import { ulid } from "../../../../common/utils";
import { DEFAULT_USER_GENDER, createOAuthAccount, createUser } from "../../../../domain/entities";
import { newGender, newOAuthProvider, newOAuthProviderId, newUserId } from "../../../../domain/value-object";
import {
	OAuthAccountRepositoryMock,
	UserRepositoryMock,
	createOAuthAccountKey,
	createOAuthAccountsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { GetConnectionsUseCase } from "../get-connections.usecase";
import type { IGetConnectionsUseCase } from "../interfaces/get-connections.usecase.interface";

describe("GetConnectionsUseCase", () => {
	let getConnectionsUseCase: IGetConnectionsUseCase;
	let oauthAccountRepositoryMock: OAuthAccountRepositoryMock;
	let userRepositoryMock: UserRepositoryMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap();
		const oauthAccountMap = createOAuthAccountsMap();

		oauthAccountRepositoryMock = new OAuthAccountRepositoryMock({ oauthAccountMap });
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});

		getConnectionsUseCase = new GetConnectionsUseCase(oauthAccountRepositoryMock, userRepositoryMock);
	});

	it("should return connections with password and no oauth connections for user with password only", async () => {
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender(DEFAULT_USER_GENDER),
		});

		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.userPasswordHashMap.set(userId, "hashed_password");

		const result = await getConnectionsUseCase.execute(userId);

		expect(result.password).toBe(true);
		expect(result.discord).toBeNull();
	});

	it("should return connections with no password and no oauth connections for oauth-only user", async () => {
		const userId = newUserId(ulid());
		const provider = newOAuthProvider("discord");
		const providerId = newOAuthProviderId("discord_user_id");

		const user = createUser({
			id: userId,
			name: "test",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender(DEFAULT_USER_GENDER),
		});

		const oauthAccount = createOAuthAccount({
			userId,
			provider,
			providerId,
		});

		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.userPasswordHashMap.set(userId, "hashed_password");
		oauthAccountRepositoryMock.oauthAccountMap.set(createOAuthAccountKey(provider, providerId), oauthAccount);

		const result = await getConnectionsUseCase.execute(userId);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerId).toBe(providerId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});

	it("should return connections with multiple oauth connections", async () => {
		const userId = newUserId(ulid());
		const discordProvider = newOAuthProvider("discord");
		const discordProviderId = newOAuthProviderId("discord_user_id");

		const user = createUser({
			id: userId,
			name: "test",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender(DEFAULT_USER_GENDER),
		});

		const discordAccount = createOAuthAccount({
			userId,
			provider: discordProvider,
			providerId: discordProviderId,
		});

		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.userPasswordHashMap.set(userId, "hashed_password");
		oauthAccountRepositoryMock.oauthAccountMap.set(
			createOAuthAccountKey(discordProvider, discordProviderId),
			discordAccount,
		);

		const result = await getConnectionsUseCase.execute(userId);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(discordProvider);
			expect(result.discord.providerId).toBe(discordProviderId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});

	it("should return connections for user with password and oauth connection", async () => {
		const userId = newUserId(ulid());
		const provider = newOAuthProvider("discord");
		const providerId = newOAuthProviderId("discord_user_id");

		const user = createUser({
			id: userId,
			name: "test",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender(DEFAULT_USER_GENDER),
		});

		const oauthAccount = createOAuthAccount({
			userId,
			provider,
			providerId,
		});

		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.userPasswordHashMap.set(userId, "hashed_password");
		oauthAccountRepositoryMock.oauthAccountMap.set(createOAuthAccountKey(provider, providerId), oauthAccount);

		const result = await getConnectionsUseCase.execute(userId);

		expect(result.password).toBe(true);
		expect(result.discord).not.toBeNull();
		if (result.discord) {
			expect(result.discord.provider).toBe(provider);
			expect(result.discord.providerId).toBe(providerId);
			expect(result.discord.linkedAt).toBeInstanceOf(Date);
		}
	});
});
