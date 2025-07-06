import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import {
	type AccountAssociationSession,
	createAccountAssociationSession,
	createUser,
} from "../../../../domain/entities";
import {
	newAccountAssociationSessionId,
	newGender,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { AccountAssociationSessionRepositoryMock } from "../../../../tests/mocks/repositories/account-association-session.repository.mock";
import {
	createAccountAssociationSessionsMap,
	createSessionsMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { createSessionToken } from "../../../services/session";
import { ValidateAccountAssociationSessionUseCase } from "../validate-account-association-session.usecase";

describe("ValidateAccountAssociationSessionUseCase", () => {
	let validateAccountAssociationSessionUseCase: ValidateAccountAssociationSessionUseCase;
	let userRepositoryMock: UserRepositoryMock;
	let accountAssociationSessionRepositoryMock: AccountAssociationSessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const userPasswordHashMap = new Map();
		const sessionMap = createSessionsMap();
		const accountAssociationSessionMap = createAccountAssociationSessionsMap();

		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		accountAssociationSessionRepositoryMock = new AccountAssociationSessionRepositoryMock({
			accountAssociationSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
			userRepositoryMock,
			accountAssociationSessionRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should validate account association session successfully with valid token", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: "12345678",
			email: user.email,
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		// create session token
		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(sessionId, session);

		const result = await validateAccountAssociationSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("accountAssociationSession");
		expect(result).toHaveProperty("user");

		if (!isErr(result)) {
			expect(result.accountAssociationSession.id).toBe(sessionId);
			expect(result.accountAssociationSession.userId).toBe(userId);
			expect(result.user.id).toBe(userId);
		}
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error for invalid token format", async () => {
		const invalidToken = "invalid_token_format";

		const result = await validateAccountAssociationSessionUseCase.execute(invalidToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error for non-existent session", async () => {
		const sessionId = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionToken = createSessionToken(sessionId, sessionSecret);

		const result = await validateAccountAssociationSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_EXPIRED error for expired session", async () => {
		// create account association session that is expired
		const sessionId = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const expiredSession: AccountAssociationSession = {
			id: sessionId,
			userId: newUserId(ulid()),
			code: "12345678",
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			expiresAt: new Date(Date.now() - 1000),
		};

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save session
		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(sessionId, expiredSession);

		const result = await validateAccountAssociationSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_EXPIRED");
		}

		// verify session is deleted
		expect(accountAssociationSessionRepositoryMock.accountAssociationSessionMap.has(sessionId)).toBe(false);
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error for invalid session secret", async () => {
		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: newUserId(ulid()),
			code: "12345678",
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		// create token with different secret
		const wrongSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionToken = createSessionToken(sessionId, wrongSecret);

		// save session
		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(sessionId, session);

		const result = await validateAccountAssociationSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error when user does not exist", async () => {
		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: newUserId(ulid()),
			code: "12345678",
			email: "test@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save session but not user
		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(sessionId, session);

		const result = await validateAccountAssociationSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		// verify session is deleted
		expect(accountAssociationSessionRepositoryMock.accountAssociationSessionMap.has(sessionId)).toBe(false);
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error when user email does not match", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "user@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create account association session with different email
		const sessionId = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: "12345678",
			email: "session@example.com",
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(sessionId, session);

		const result = await validateAccountAssociationSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		// verify session is deleted
		expect(accountAssociationSessionRepositoryMock.accountAssociationSessionMap.has(sessionId)).toBe(false);
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error when user email is not verified", async () => {
		// create user with unverified email
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create account association session
		const sessionId = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createAccountAssociationSession({
			id: sessionId,
			userId: userId,
			code: "12345678",
			email: user.email,
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(sessionId, session);

		const result = await validateAccountAssociationSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		// verify session is deleted
		expect(accountAssociationSessionRepositoryMock.accountAssociationSessionMap.has(sessionId)).toBe(false);
	});
});
