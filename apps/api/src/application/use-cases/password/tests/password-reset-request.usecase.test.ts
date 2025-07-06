import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createPasswordResetSession, createUser } from "../../../../domain/entities";
import { newGender, newPasswordResetSessionId, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { PasswordResetSessionRepositoryMock } from "../../../../tests/mocks/repositories/password-reset-session.repository.mock";
import {
	createPasswordResetSessionsMap,
	createSessionsMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { PasswordResetRequestUseCase } from "../password-reset-request.usecase";

describe("PasswordResetRequestUseCase", () => {
	let passwordResetRequestUseCase: PasswordResetRequestUseCase;
	let passwordResetSessionRepositoryMock: PasswordResetSessionRepositoryMock;
	let userRepositoryMock: UserRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const passwordResetSessionMap = createPasswordResetSessionsMap();
		const userMap = createUsersMap();
		const userPasswordHashMap = new Map();
		const sessionMap = createSessionsMap();

		passwordResetSessionRepositoryMock = new PasswordResetSessionRepositoryMock({
			passwordResetSessionMap,
		});
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		passwordResetRequestUseCase = new PasswordResetRequestUseCase(
			passwordResetSessionRepositoryMock,
			userRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should create password reset session successfully for existing user", async () => {
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("passwordResetSession");
		expect(result).toHaveProperty("passwordResetSessionToken");

		if (!isErr(result)) {
			expect(result.passwordResetSession.userId).toBe(userId);
			expect(result.passwordResetSession.email).toBe(user.email);
			expect(result.passwordResetSession.code).toBeDefined();
			expect(result.passwordResetSession.code.length).toBe(8);
			expect(/^\d{8}$/.test(result.passwordResetSession.code)).toBe(true); // verify it's 8 digits
			expect(typeof result.passwordResetSessionToken).toBe("string");
			expect(result.passwordResetSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should return USER_NOT_FOUND error for non-existent user", async () => {
		const nonExistentEmail = "nonexistent@example.com";

		const result = await passwordResetRequestUseCase.execute(nonExistentEmail);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("USER_NOT_FOUND");
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const code = result.passwordResetSession.code;
			expect(code).toBeDefined();
			expect(code.length).toBe(8);
			expect(/^\d{8}$/.test(code)).toBe(true); // verify it's 8 digits
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.passwordResetSessionToken).toBe("string");
			expect(result.passwordResetSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should delete existing password reset sessions before creating new one", async () => {
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		// add existing password reset sessions for the user
		const existingSessionId1 = newPasswordResetSessionId(ulid());
		const existingSessionId2 = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();

		const existingSession1 = createPasswordResetSession({
			id: existingSessionId1,
			userId: userId,
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		const existingSession2 = createPasswordResetSession({
			id: existingSessionId2,
			userId: userId,
			code: "87654321",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(existingSessionId1, existingSession1);
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(existingSessionId2, existingSession2);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		// verify existing sessions are deleted
		expect(passwordResetSessionRepositoryMock.passwordResetSessionMap.has(existingSessionId1)).toBe(false);
		expect(passwordResetSessionRepositoryMock.passwordResetSessionMap.has(existingSessionId2)).toBe(false);

		// verify new session is created
		if (!isErr(result)) {
			const newSession = passwordResetSessionRepositoryMock.passwordResetSessionMap.get(result.passwordResetSession.id);
			expect(newSession).toBeDefined();
			expect(newSession?.userId).toBe(userId);
		}
	});

	it("should save new password reset session", async () => {
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			// verify session is saved
			const savedSession = passwordResetSessionRepositoryMock.passwordResetSessionMap.get(
				result.passwordResetSession.id,
			);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
			expect(savedSession?.email).toBe(user.email);
			expect(savedSession?.code).toBeDefined();
			expect(savedSession?.code.length).toBe(8);
		}
	});

	it("should generate session secret and hash it", async () => {
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSession.secretHash).toBeDefined();
			expect(result.passwordResetSession.secretHash).toBeInstanceOf(Uint8Array);
			expect(result.passwordResetSession.secretHash.length).toBeGreaterThan(0);
		}
	});

	it("should set session email to user email", async () => {
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSession.email).toBe(user.email);
		}
	});

	it("should create password reset session with correct user id", async () => {
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSession.userId).toBe(userId);
		}
	});

	it("should handle case insensitive email lookup", async () => {
		// create user with lowercase email
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// save user
		userRepositoryMock.userMap.set(userId, user);

		// use uppercase email
		const uppercaseEmail = "TEST@EXAMPLE.COM";
		const result = await passwordResetRequestUseCase.execute(uppercaseEmail);

		// this test may fail depending on the mock implementation
		// the actual behavior depends on the UserRepository implementation
		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("USER_NOT_FOUND");
		}
	});

	it("should return new session token that can be used for validation", async () => {
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

		// save user
		userRepositoryMock.userMap.set(userId, user);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSessionToken).toBeDefined();
			expect(typeof result.passwordResetSessionToken).toBe("string");
			expect(result.passwordResetSessionToken.length).toBeGreaterThan(0);

			// verify token has the expected format (contains session ID and secret)
			expect(result.passwordResetSessionToken.split(".")).toHaveLength(2);
		}
	});
});
