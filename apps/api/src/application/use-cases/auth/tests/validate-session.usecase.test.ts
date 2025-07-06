import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import {
	type Session,
	createSession,
	createUser,
	sessionExpiresSpan,
	sessionRefreshSpan,
} from "../../../../domain/entities";
import { newGender, newSessionId, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { SessionRepositoryMock } from "../../../../tests/mocks/repositories/session.repository.mock";
import {
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { createSessionToken } from "../../../services/session";
import { ValidateSessionUseCase } from "../validate-session.usecase";

describe("ValidateSessionUseCase", () => {
	let validateSessionUseCase: ValidateSessionUseCase;
	let sessionRepositoryMock: SessionRepositoryMock;
	let userRepositoryMock: UserRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap();

		sessionRepositoryMock = new SessionRepositoryMock({
			sessionMap,
		});
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		validateSessionUseCase = new ValidateSessionUseCase(
			sessionSecretServiceMock,
			sessionRepositoryMock,
			userRepositoryMock,
		);
	});

	it("should validate session successfully with valid session token", async () => {
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

		// create session
		const sessionId = newSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: userId,
			secretHash: sessionSecretHash,
		});

		// create session token
		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// setup mocks
		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.sessionMap.set(sessionId, session);
		sessionRepositoryMock.sessionMap.set(sessionId, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("user");

		if (!isErr(result)) {
			expect(result.session.id).toBe(sessionId);
			expect(result.session.userId).toBe(userId);
			expect(result.user.id).toBe(userId);
			expect(result.user.email).toBe("test@example.com");
		}
	});

	it("should return SESSION_INVALID error when session token is invalid format", async () => {
		const invalidToken = "invalid_token_format";

		const result = await validateSessionUseCase.execute(invalidToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_INVALID error when session does not exist", async () => {
		const sessionId = newSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionToken = createSessionToken(sessionId, sessionSecret);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_INVALID error when user does not exist", async () => {
		// create session without user
		const sessionId = newSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: newUserId(ulid()),
			secretHash: sessionSecretHash,
		});

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// setup mocks
		userRepositoryMock.sessionMap.set(sessionId, session);
		sessionRepositoryMock.sessionMap.set(sessionId, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_INVALID error when session secret is invalid", async () => {
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

		// create session
		const sessionId = newSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: userId,
			secretHash: sessionSecretHash,
		});

		// setup mocks
		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.sessionMap.set(sessionId, session);
		sessionRepositoryMock.sessionMap.set(sessionId, session);

		const invalidSessionToken = createSessionToken(sessionId, "invalid_secret");
		const result = await validateSessionUseCase.execute(invalidSessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_EXPIRED error and delete session when session is expired", async () => {
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

		// create expired session
		const sessionId = newSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const session: Session = {
			id: sessionId,
			userId: userId,
			secretHash: sessionSecretHash,
			expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
		};

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// setup mocks
		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.sessionMap.set(sessionId, session);
		sessionRepositoryMock.sessionMap.set(sessionId, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SESSION_EXPIRED");
		}

		// verify session is deleted
		expect(sessionRepositoryMock.sessionMap.has(sessionId)).toBe(false);
	});

	it("should refresh session when session is refreshable", async () => {
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

		// create session that is refreshable (within refresh window)
		const sessionId = newSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const session: Session = {
			id: sessionId,
			userId: userId,
			secretHash: sessionSecretHash,
			expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds() - sessionRefreshSpan.milliseconds() - 1), // 23 hours from now (within refresh window)
		};

		const sessionToken = createSessionToken(sessionId, sessionSecret);

		// setup mocks
		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.sessionMap.set(sessionId, session);
		sessionRepositoryMock.sessionMap.set(sessionId, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.session.id).toBe(sessionId);
			expect(result.user.id).toBe(userId);
			// verify session was refreshed (saved again)
			const savedSession = sessionRepositoryMock.sessionMap.get(sessionId);
			expect(savedSession).toBeDefined();
		}
	});
});
