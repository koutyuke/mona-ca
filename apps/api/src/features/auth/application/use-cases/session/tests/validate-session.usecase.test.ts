import { assert, beforeEach, describe, expect, it } from "vitest";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { sessionExpiresSpan, sessionRefreshSpan } from "../../../../domain/entities/session";
import { encodeToken, newSessionToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SessionRepositoryMock,
	createAuthUserMap,
	createSessionMap,
} from "../../../../testing/mocks/repositories";
import { ValidateSessionUseCase } from "../validate-session.usecase";

const sessionMap = createSessionMap();
const authUserMap = createAuthUserMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const validateSessionUseCase = new ValidateSessionUseCase(authUserRepository, sessionRepository, tokenSecretService);

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
	},
});

describe("ValidateSessionUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		authUserMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("Success: should validate session with valid session token and return session and user", async () => {
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session: validatedSession, userCredentials } = result.value;

		expect(validatedSession.id).toBe(session.id);
		expect(validatedSession.userId).toBe(userRegistration.id);
		expect(userCredentials.id).toBe(userRegistration.id);
		expect(userCredentials.email).toBe(userRegistration.email);

		// セッションが削除されていないこと
		expect(sessionMap.has(session.id)).toBe(true);
	});

	it("Success: should refresh session when session is refreshable", async () => {
		const refreshableExpiresAt = new Date(
			Date.now() + sessionExpiresSpan.milliseconds() - sessionRefreshSpan.milliseconds() - 1,
		);
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: userRegistration.id,
				expiresAt: refreshableExpiresAt,
			},
		});

		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session: validatedSession, userCredentials } = result.value;

		expect(validatedSession.id).toBe(session.id);
		expect(userCredentials.id).toBe(userRegistration.id);

		// セッションの有効期限が延長されていること
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toBeDefined();
		assert(savedSession);
		expect(savedSession.expiresAt.getTime()).toBeGreaterThan(refreshableExpiresAt.getTime());
	});

	it("Error: should return INVALID_SESSION error when session token is invalid format", async () => {
		const invalidToken = newSessionToken("invalid_token_format");

		const result = await validateSessionUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SESSION");
	});

	it("Error: should return INVALID_SESSION error when session token is empty", async () => {
		const result = await validateSessionUseCase.execute(newSessionToken(""));

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SESSION");
	});

	it("Error: should return INVALID_SESSION error when session does not exist", async () => {
		const { sessionToken } = createSessionFixture();

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SESSION");
	});

	it("Error: should return INVALID_SESSION error when user does not exist", async () => {
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		authUserMap.clear();
		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SESSION");
	});

	it("Error: should return INVALID_SESSION error when session secret is invalid", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		sessionMap.set(session.id, session);

		const invalidSessionToken = encodeToken(session.id, "invalid_secret");
		const result = await validateSessionUseCase.execute(invalidSessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SESSION");
	});

	it("Error: should return EXPIRED_SESSION error and delete session when session is expired", async () => {
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: userRegistration.id,
				expiresAt: new Date(0),
			},
		});

		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EXPIRED_SESSION");

		// セキュリティ: 期限切れセッションは削除されること
		expect(sessionMap.has(session.id)).toBe(false);
	});
});
