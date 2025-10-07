import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { type PasswordResetSession, createPasswordResetSession, createUser } from "../../../../domain/entities";
import { newGender, newPasswordResetSessionId, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { PasswordResetSessionRepositoryMock } from "../../../../tests/mocks/repositories/password-reset-session.repository.mock";
import {
	createPasswordResetSessionsMap,
	createSessionsMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { createSessionToken } from "../../../services/session";
import { ValidatePasswordResetSessionUseCase } from "../validate-password-reset-session.usecase";

describe("ValidatePasswordResetSessionUseCase", () => {
	let validatePasswordResetSessionUseCase: ValidatePasswordResetSessionUseCase;
	let passwordResetSessionRepositoryMock: PasswordResetSessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;
	let userRepositoryMock: UserRepositoryMock;

	beforeEach(() => {
		const passwordResetSessionMap = createPasswordResetSessionsMap();
		const userMap = createUsersMap();
		const userPasswordHashMap = new Map();
		const sessionMap = createSessionsMap();

		passwordResetSessionRepositoryMock = new PasswordResetSessionRepositoryMock({
			passwordResetSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});

		validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
			passwordResetSessionRepositoryMock,
			sessionSecretServiceMock,
			userRepositoryMock,
		);
	});

	it("should validate password reset session successfully with valid token", async () => {
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

		// create password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		// create session token
		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		const result = await validatePasswordResetSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("passwordResetSession");
		expect(result).toHaveProperty("user");

		if (!isErr(result)) {
			expect(result.passwordResetSession.id).toBe(sessionId);
			expect(result.passwordResetSession.userId).toBe(userId);
			expect(result.user.id).toBe(userId);
		}
	});

	it("should return PASSWORD_RESET_SESSION_INVALID error for invalid token format", async () => {
		const invalidToken = "invalid_token_format";

		const result = await validatePasswordResetSessionUseCase.execute(invalidToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_INVALID");
		}
	});

	it("should return PASSWORD_RESET_SESSION_INVALID error for non-existent session", async () => {
		const sessionId = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionToken = createSessionToken(sessionId, sessionSecret);

		const result = await validatePasswordResetSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_INVALID");
		}
	});

	it("should return PASSWORD_RESET_SESSION_INVALID error when user does not exist", async () => {
		// create password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: newUserId(ulid()),
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: "test@example.com",
		});

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save session but not user
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		const result = await validatePasswordResetSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_INVALID");
		}

		// verify session is deleted
		expect(passwordResetSessionRepositoryMock.passwordResetSessionMap.has(sessionId)).toBe(false);
	});

	it("should return PASSWORD_RESET_SESSION_INVALID error for invalid session secret", async () => {
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

		// create password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		// create token with different secret
		const wrongSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionToken = createSessionToken(sessionId, wrongSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		const result = await validatePasswordResetSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_INVALID");
		}
	});

	it("should return PASSWORD_RESET_SESSION_EXPIRED error for expired session", async () => {
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

		// create password reset session that is expired
		const sessionId = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const expiredSession: PasswordResetSession = {
			id: sessionId,
			userId: userId,
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
			emailVerified: true,
			expiresAt: new Date(Date.now() - 1000),
		};

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, expiredSession);

		const result = await validatePasswordResetSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_EXPIRED");
		}

		// verify session is deleted
		expect(passwordResetSessionRepositoryMock.passwordResetSessionMap.has(sessionId)).toBe(false);
	});

	it("should verify session secret using session secret service", async () => {
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

		// create password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		// create session token
		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		const result = await validatePasswordResetSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSession.id).toBe(sessionId);
			expect(result.user.id).toBe(userId);
		}
	});

	it("should check session expiry and delete expired sessions", async () => {
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

		// create expired password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const expiredSession: PasswordResetSession = {
			id: sessionId,
			userId: userId,
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
			emailVerified: true,
			expiresAt: new Date(Date.now() - 1000),
		};

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, expiredSession);

		const result = await validatePasswordResetSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		// verify expired session is deleted
		expect(passwordResetSessionRepositoryMock.passwordResetSessionMap.has(sessionId)).toBe(false);
	});

	it("should validate user exists and matches session", async () => {
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

		// create password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// save user and session
		userRepositoryMock.userMap.set(userId, user);
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		const result = await validatePasswordResetSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.user.id).toBe(userId);
			expect(result.passwordResetSession.userId).toBe(userId);
			expect(result.user.id).toBe(result.passwordResetSession.userId);
		}
	});
});
