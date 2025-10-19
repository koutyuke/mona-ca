import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import { sessionExpiresSpan, sessionRefreshSpan } from "../../../../domain/entities/session";
import { formatAnySessionToken, newSessionToken } from "../../../../domain/value-objects/session-token";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SessionRepositoryMock,
	createAuthUserMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { ValidateSessionUseCase } from "../validate-session.usecase";

const sessionMap = createSessionsMap();
const authUserMap = createAuthUserMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();

const validateSessionUseCase = new ValidateSessionUseCase(sessionRepository, authUserRepository, sessionSecretHasher);

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

	afterAll(() => {
		sessionMap.clear();
		authUserMap.clear();
	});

	it("should validate session successfully with valid session token", async () => {
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session: validatedSession, userIdentity } = result.value;
			expect(validatedSession.id).toBe(session.id);
			expect(validatedSession.userId).toBe(userIdentity.id);
			expect(userIdentity.id).toBe(userRegistration.id);
			expect(userIdentity.email).toBe(userRegistration.email);
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

		authUserMap.clear();
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
				userId: userRegistration.id,
			},
		});

		sessionMap.set(session.id, session);

		const invalidSessionToken = formatAnySessionToken(session.id, "invalid_secret");
		const result = await validateSessionUseCase.execute(invalidSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SESSION_INVALID");
		}
	});

	it("should return SESSION_EXPIRED error and delete session when session is expired", async () => {
		const { session, sessionToken } = createSessionFixture({
			session: {
				userId: userRegistration.id,
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
				userId: userRegistration.id,
				expiresAt: refreshableExpiresAt,
			},
		});

		sessionMap.set(session.id, session);

		const result = await validateSessionUseCase.execute(sessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session: validatedSession, userIdentity } = result.value;
			expect(validatedSession.id).toBe(session.id);
			expect(userIdentity.id).toBe(userRegistration.id);

			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
		}
	});
});
