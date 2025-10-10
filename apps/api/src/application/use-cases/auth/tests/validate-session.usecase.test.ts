import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { sessionExpiresSpan, sessionRefreshSpan } from "../../../../domain/entities";
import { formatSessionToken, newSessionToken } from "../../../../domain/value-object";
import { createSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	SessionRepositoryMock,
	UserRepositoryMock,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { ValidateSessionUseCase } from "../validate-session.usecase";

const sessionMap = createSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const sessionRepositoryMock = new SessionRepositoryMock({
	sessionMap,
});
const userRepositoryMock = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const validateSessionUseCase = new ValidateSessionUseCase(sessionRepositoryMock, userRepositoryMock);

const { user, passwordHash } = createUserFixture({
	user: {
		email: "test@example.com",
		name: "test_user",
	},
	passwordHash: "hashed_password",
});

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

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("user");

		if (!isErr(result)) {
			expect(result.session.id).toBe(session.id);
			expect(result.session.userId).toBe(user.id);
			expect(result.user.id).toBe(user.id);
			expect(result.user.email).toBe(user.email);
		}
	});

	it("should return SESSION_INVALID error when session token is invalid format", async () => {
		const invalidToken = newSessionToken("invalid_token_format");

		const result = await validateSessionUseCase.execute(invalidToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_INVALID error when session does not exist", async () => {
		const { sessionToken } = createSessionFixture();

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_INVALID error when user does not exist", async () => {
		const { session, sessionToken } = createSessionFixture();

		userMap.clear();
		userPasswordHashMap.clear();
		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
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

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
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

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
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

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.session.id).toBe(session.id);
			expect(result.user.id).toBe(user.id);

			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
		}
	});
});
