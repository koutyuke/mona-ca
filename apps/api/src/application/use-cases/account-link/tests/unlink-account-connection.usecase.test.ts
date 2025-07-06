import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
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
import type { IUnlinkAccountConnectionUseCase } from "../interfaces/unlink-account-connection.usecase.interface";
import { UnlinkAccountConnectionUseCase } from "../unlink-account-connection.usecase";

describe("UnlinkAccountConnectionUseCase", () => {
	let unlinkAccountConnectionUseCase: IUnlinkAccountConnectionUseCase;
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

		unlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(oauthAccountRepositoryMock, userRepositoryMock);
	});

	it("should return ACCOUNT_NOT_LINKED error when user has no linked account for provider", async () => {
		const userId = newUserId(ulid());
		const provider = newOAuthProvider("discord");

		const result = await unlinkAccountConnectionUseCase.execute(provider, userId);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_NOT_LINKED");
		}
	});

	it("should return PASSWORD_NOT_SET error when user has no password", async () => {
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
		// No password hash set
		oauthAccountRepositoryMock.oauthAccountMap.set(createOAuthAccountKey(provider, providerId), oauthAccount);

		const result = await unlinkAccountConnectionUseCase.execute(provider, userId);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("PASSWORD_NOT_SET");
		}
	});

	it("should successfully unlink account when user has password and linked account", async () => {
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

		const result = await unlinkAccountConnectionUseCase.execute(provider, userId);

		expect(isErr(result)).toBe(false);
		expect(oauthAccountRepositoryMock.oauthAccountMap.has(createOAuthAccountKey(provider, providerId))).toBe(false);
	});

	it("should return UNLINK_OPERATION_FAILED error when repository operation fails", async () => {
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

		// Mock repository to throw error
		const originalDelete = oauthAccountRepositoryMock.deleteByUserIdAndProvider;
		oauthAccountRepositoryMock.deleteByUserIdAndProvider = async () => {
			throw new Error("Database error");
		};

		const result = await unlinkAccountConnectionUseCase.execute(provider, userId);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("UNLINK_OPERATION_FAILED");
		}

		// Restore original method
		oauthAccountRepositoryMock.deleteByUserIdAndProvider = originalDelete;
	});
});
