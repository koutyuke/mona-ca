import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createAccountAssociationSession, createOAuthAccount, createUser } from "../../../../domain/entities";
import {
	newAccountAssociationSessionId,
	newGender,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../../../domain/value-object";
import {
	AccountAssociationSessionRepositoryMock,
	OAuthAccountRepositoryMock,
	SessionRepositoryMock,
	SessionSecretServiceMock,
	UserRepositoryMock,
	createAccountAssociationSessionsMap,
	createOAuthAccountKey,
	createOAuthAccountsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { AccountAssociationConfirmUseCase } from "../account-association-confirm.usecase";

describe("AccountAssociationConfirmUseCase", () => {
	let accountAssociationConfirmUseCase: AccountAssociationConfirmUseCase;
	let sessionRepositoryMock: SessionRepositoryMock;
	let userRepositoryMock: UserRepositoryMock;
	let oauthAccountRepositoryMock: OAuthAccountRepositoryMock;
	let accountAssociationSessionRepositoryMock: AccountAssociationSessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const sessionMap = createSessionsMap();
		const userMap = createUsersMap();
		const userPasswordHashMap = createUserPasswordHashMap();
		const oauthAccountMap = createOAuthAccountsMap();
		const accountAssociationSessionMap = createAccountAssociationSessionsMap();

		sessionRepositoryMock = new SessionRepositoryMock({
			sessionMap,
		});
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		oauthAccountRepositoryMock = new OAuthAccountRepositoryMock({
			oauthAccountMap,
		});
		accountAssociationSessionRepositoryMock = new AccountAssociationSessionRepositoryMock({
			accountAssociationSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		accountAssociationConfirmUseCase = new AccountAssociationConfirmUseCase(
			userRepositoryMock,
			sessionRepositoryMock,
			oauthAccountRepositoryMock,
			accountAssociationSessionRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should confirm account association successfully with valid code", async () => {
		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: code,
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(sessionId, session);
		userRepositoryMock.userMap.set(userId, user);

		const result = await accountAssociationConfirmUseCase.execute(code, session);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(userId);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
			expect(result.sessionToken.includes(".")).toBe(true);
		}

		// verify account association session is deleted
		expect(accountAssociationSessionRepositoryMock.accountAssociationSessionMap.has(sessionId)).toBe(false);

		// verify OAuth account is created
		const savedOAuthAccount = oauthAccountRepositoryMock.oauthAccountMap.get(
			createOAuthAccountKey(newOAuthProvider("discord"), newOAuthProviderId("discord_provider_id")),
		);
		expect(savedOAuthAccount).toBeDefined();
		expect(savedOAuthAccount?.userId).toBe(userId);
		expect(savedOAuthAccount?.provider).toBe(newOAuthProvider("discord"));
		expect(savedOAuthAccount?.providerId).toBe(newOAuthProviderId("discord_provider_id"));
	});

	it("should return INVALID_ASSOCIATION_CODE error when code is null", async () => {
		// create account association session without code
		const sessionId = newAccountAssociationSessionId(ulid());
		const userId = newUserId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: null,
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationConfirmUseCase.execute("12345678", session);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_ASSOCIATION_CODE");
		}
	});

	it("should return INVALID_ASSOCIATION_CODE error when code does not match", async () => {
		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const userId = newUserId(ulid());
		const correctCode = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: correctCode,
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const wrongCode = "87654321";
		const result = await accountAssociationConfirmUseCase.execute(wrongCode, session);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_ASSOCIATION_CODE");
		}
	});

	it("should return OAUTH_PROVIDER_ALREADY_LINKED error when user already has account for the provider", async () => {
		// create existing OAuth account for the user and provider
		const userId = newUserId(ulid());
		const existingOAuthAccount = createOAuthAccount({
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("existing_provider_id"),
			userId: userId,
		});

		oauthAccountRepositoryMock.oauthAccountMap.set(
			createOAuthAccountKey(newOAuthProvider("discord"), newOAuthProviderId("existing_provider_id")),
			existingOAuthAccount,
		);

		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: code,
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("new_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationConfirmUseCase.execute(code, session);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_PROVIDER_ALREADY_LINKED");
		}
	});

	it("should return OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER error when OAuth account is linked to another user", async () => {
		// create existing OAuth account linked to another user
		const anotherUserId = newUserId(ulid());
		const existingOAuthAccount = createOAuthAccount({
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			userId: anotherUserId,
		});

		oauthAccountRepositoryMock.oauthAccountMap.set(
			createOAuthAccountKey(newOAuthProvider("discord"), newOAuthProviderId("discord_provider_id")),
			existingOAuthAccount,
		);

		// create account association session for current user
		const sessionId = newAccountAssociationSessionId(ulid());
		const userId = newUserId(ulid());
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: code,
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationConfirmUseCase.execute(code, session);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER");
		}
	});

	it("should create and save new session on successful account association", async () => {
		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});
		userRepositoryMock.userMap.set(userId, user);
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: code,
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationConfirmUseCase.execute(code, session);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
		}
	});

	it("should create and save OAuth account on successful account association", async () => {
		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});
		userRepositoryMock.userMap.set(userId, user);
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: code,
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationConfirmUseCase.execute(code, session);

		expect(isErr(result)).toBe(false);

		// verify OAuth account is saved
		const savedOAuthAccount = oauthAccountRepositoryMock.oauthAccountMap.get(
			createOAuthAccountKey(newOAuthProvider("discord"), newOAuthProviderId("discord_provider_id")),
		);
		expect(savedOAuthAccount).toBeDefined();
		expect(savedOAuthAccount?.userId).toBe(userId);
		expect(savedOAuthAccount?.provider).toBe(newOAuthProvider("discord"));
		expect(savedOAuthAccount?.providerId).toBe(newOAuthProviderId("discord_provider_id"));
	});

	it("should allow association when no existing conflicts", async () => {
		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});
		userRepositoryMock.userMap.set(userId, user);
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: code,
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationConfirmUseCase.execute(code, session);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(userId);
		}
	});
});
