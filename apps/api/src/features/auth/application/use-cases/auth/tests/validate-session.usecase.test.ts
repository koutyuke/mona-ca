import { beforeEach, describe, expect, it } from "vitest";
import { formatSessionToken, newSessionToken } from "../../../../../../common/domain/value-objects";
import { createSessionFixture, createUserFixture } from "../../../../../../tests/fixtures";
import {
	PasswordHasherMock,
	SessionRepositoryMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../../../tests/mocks";
import { sessionExpiresSpan, sessionRefreshSpan } from "../../../../domain/entities";
import { ValidateSessionUseCase } from "../validate-session.usecase";

const sessionMap = createSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();
const passwordHasher = new PasswordHasherMock();

const validateSessionUseCase = new ValidateSessionUseCase(sessionRepository, userRepository, sessionSecretHasher);

const { user } = createUserFixture({
	user: {
		email: "test@example.com",
	},
});
const password = "password123";
const passwordHash = await passwordHasher.hash(password);

describe("ValidateSessionUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();

		userMap.set(user.id, user);
		if (passwordHash) {
			userPasswordHashMap.set(user.id, passwordHash);
		}
	});

	it("should validate session successfully with valid session token", async () => {
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, user } = result.value;
			expect(session.id).toBe(session.id);
			expect(session.userId).toBe(user.id);
			expect(user.id).toBe(user.id);
			expect(user.email).toBe(user.email);
		}
	});

	it("should return SESSION_INVALID error when session token is invalid format", async () => {
		const invalidToken = newSessionToken("invalid_token_format");

		const result = await validateSessionUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_INVALID error when session does not exist", async () => {
		const { sessionToken } = createSessionFixture();

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_INVALID error when user does not exist", async () => {
		const { session, sessionToken } = createSessionFixture();

		userMap.clear();
		userPasswordHashMap.clear();
		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_INVALID error when session secret is invalid", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		sessionMap.set(session.id, session);

		const invalidSessionToken = formatSessionToken(session.id, "invalid_secret");
		const result = await validateSessionUseCase.execute(invalidSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_EXPIRED error and delete session when session is expired", async () => {
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: user.id,
				expiresAt: new Date(0),
			},
		});

		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SESSION_EXPIRED");
		}

		expect(sessionMap.has(session.id)).toBe(false);
	});

	it("should refresh session when session is refreshable", async () => {
		const refreshableExpiresAt = new Date(
			Date.now() + sessionExpiresSpan.milliseconds() - sessionRefreshSpan.milliseconds() - 1,
		);
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: user.id,
				expiresAt: refreshableExpiresAt,
			},
		});

		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			expect(session.id).toBe(session.id);
			expect(user.id).toBe(user.id);

			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
		}
	});
});
