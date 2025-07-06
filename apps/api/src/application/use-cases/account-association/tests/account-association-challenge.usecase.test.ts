import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createAccountAssociationSession, createUser } from "../../../../domain/entities";
import {
	newAccountAssociationSessionId,
	newGender,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { AccountAssociationSessionRepositoryMock } from "../../../../tests/mocks/repositories/account-association-session.repository.mock";
import { createAccountAssociationSessionsMap } from "../../../../tests/mocks/repositories/table-maps";
import { AccountAssociationChallengeUseCase } from "../account-association-challenge.usecase";

describe("AccountAssociationChallengeUseCase", () => {
	let accountAssociationChallengeUseCase: AccountAssociationChallengeUseCase;
	let accountAssociationSessionRepositoryMock: AccountAssociationSessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const accountAssociationSessionMap = createAccountAssociationSessionsMap();

		accountAssociationSessionRepositoryMock = new AccountAssociationSessionRepositoryMock({
			accountAssociationSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
			sessionSecretServiceMock,
			accountAssociationSessionRepositoryMock,
		);
	});

	it("should create account association challenge successfully", async () => {
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

		// create existing account association session
		const existingSessionId = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const existingSession = createAccountAssociationSession({
			id: existingSessionId,
			userId: userId,
			code: null,
			email: user.email,
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(existingSessionId, existingSession);

		const result = await accountAssociationChallengeUseCase.execute(user, existingSession);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("accountAssociationSession");
		expect(result).toHaveProperty("accountAssociationSessionToken");

		if (!isErr(result)) {
			expect(result.accountAssociationSession.userId).toBe(userId);
			expect(result.accountAssociationSession.email).toBe(user.email);
			expect(result.accountAssociationSession.provider).toBe(newOAuthProvider("discord"));
			expect(result.accountAssociationSession.providerId).toBe(newOAuthProviderId("discord_provider_id"));
			expect(result.accountAssociationSession.code).toBeDefined();
			expect(result.accountAssociationSession.code?.length).toBe(8);
			expect(/^\d{8}$/.test(result.accountAssociationSession.code!)).toBe(true); // verify it's 8 digits
			expect(typeof result.accountAssociationSessionToken).toBe("string");
			expect(result.accountAssociationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should delete existing account association sessions before creating new one", async () => {
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

		// create multiple existing sessions for the same user
		const existingSessionId1 = newAccountAssociationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();

		const existingSession1 = createAccountAssociationSession({
			id: existingSessionId1,
			userId: userId,
			code: null,
			email: user.email,
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		accountAssociationSessionRepositoryMock.accountAssociationSessionMap.set(existingSessionId1, existingSession1);

		const result = await accountAssociationChallengeUseCase.execute(user, existingSession1);

		expect(isErr(result)).toBe(false);

		// verify existing sessions are deleted
		expect(accountAssociationSessionRepositoryMock.accountAssociationSessionMap.has(existingSessionId1)).toBe(false);

		// verify new session is created
		if (!isErr(result)) {
			const newSession = accountAssociationSessionRepositoryMock.accountAssociationSessionMap.get(
				result.accountAssociationSession.id,
			);
			expect(newSession).toBeDefined();
			expect(newSession?.userId).toBe(userId);
		}
	});

	it("should generate 8-digit numeric verification code", async () => {
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
			code: null,
			email: user.email,
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationChallengeUseCase.execute(user, session);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const code = result.accountAssociationSession.code;
			expect(code).toBeDefined();
			expect(code?.length).toBe(8);
			expect(/^\d{8}$/.test(code!)).toBe(true); // verify it's 8 digits
		}
	});

	it("should create session token with correct format", async () => {
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
			code: null,
			email: user.email,
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationChallengeUseCase.execute(user, session);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.accountAssociationSessionToken).toBe("string");
			expect(result.accountAssociationSessionToken.length).toBeGreaterThan(0);
			expect(result.accountAssociationSessionToken.includes(".")).toBe(true);
		}
	});

	it("should save new account association session with updated data", async () => {
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
			code: null,
			email: user.email,
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("discord_provider_id"),
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		const result = await accountAssociationChallengeUseCase.execute(user, session);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			// verify session is saved
			const savedSession = accountAssociationSessionRepositoryMock.accountAssociationSessionMap.get(
				result.accountAssociationSession.id,
			);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
			expect(savedSession?.code).toBeDefined();
			expect(savedSession?.email).toBe(user.email);
			expect(savedSession?.provider).toBe(newOAuthProvider("discord"));
			expect(savedSession?.providerId).toBe(newOAuthProviderId("discord_provider_id"));
		}
	});
});
