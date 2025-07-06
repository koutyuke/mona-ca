import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { type EmailVerificationSession, createEmailVerificationSession, createUser } from "../../../../domain/entities";
import { newEmailVerificationSessionId, newGender, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { EmailVerificationSessionRepositoryMock } from "../../../../tests/mocks/repositories/email-verification-session.repository.mock";
import { createEmailVerificationSessionsMap } from "../../../../tests/mocks/repositories/table-maps";
import { createSessionToken } from "../../../services/session";
import { ValidateEmailVerificationSessionUseCase } from "../validate-email-verification-session.usecase";

describe("ValidateEmailVerificationSessionUseCase", () => {
	let validateEmailVerificationSessionUseCase: ValidateEmailVerificationSessionUseCase;
	let emailVerificationSessionRepositoryMock: EmailVerificationSessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const emailVerificationSessionMap = createEmailVerificationSessionsMap();

		emailVerificationSessionRepositoryMock = new EmailVerificationSessionRepositoryMock({
			emailVerificationSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		validateEmailVerificationSessionUseCase = new ValidateEmailVerificationSessionUseCase(
			emailVerificationSessionRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should validate email verification session successfully with valid token", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create email verification session
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code: "12345678",
			secretHash: sessionSecretHash,
		});

		// create session token
		const emailVerificationSessionToken = createSessionToken(emailVerificationSessionId, sessionSecret);

		emailVerificationSessionRepositoryMock.emailVerificationSessionMap.set(
			emailVerificationSessionId,
			emailVerificationSession,
		);

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("emailVerificationSession");

		if (!isErr(result)) {
			expect(result.emailVerificationSession.id).toBe(emailVerificationSessionId);
			expect(result.emailVerificationSession.userId).toBe(userId);
			expect(result.emailVerificationSession.email).toBe("test@example.com");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when token format is invalid", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		const invalidToken = "invalid_token_format";

		const result = await validateEmailVerificationSessionUseCase.execute(invalidToken, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when session does not exist", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const emailVerificationSessionToken = createSessionToken(emailVerificationSessionId, sessionSecret);

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when user ID does not match", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create email verification session with different user ID
		const differentUserId = newUserId(ulid());
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: differentUserId,
			email: "test@example.com",
			code: "12345678",
			secretHash: sessionSecretHash,
		});

		const emailVerificationSessionToken = createSessionToken(emailVerificationSessionId, sessionSecret);

		emailVerificationSessionRepositoryMock.emailVerificationSessionMap.set(
			emailVerificationSessionId,
			emailVerificationSession,
		);

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_EXPIRED error and delete session when session is expired", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create expired email verification session
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const emailVerificationSession: EmailVerificationSession = {
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code: "12345678",
			secretHash: sessionSecretHash,
			expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
		};

		const emailVerificationSessionToken = createSessionToken(emailVerificationSessionId, sessionSecret);

		emailVerificationSessionRepositoryMock.emailVerificationSessionMap.set(
			emailVerificationSessionId,
			emailVerificationSession,
		);

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_EXPIRED");
		}

		// verify session is deleted
		expect(emailVerificationSessionRepositoryMock.emailVerificationSessionMap.has(emailVerificationSessionId)).toBe(
			false,
		);
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when session secret is invalid", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create email verification session
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const sessionSecret = "wrong_secret";
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code: "12345678",
			secretHash: sessionSecretHash,
		});

		const emailVerificationSessionToken = createSessionToken(emailVerificationSessionId, sessionSecret);

		emailVerificationSessionRepositoryMock.emailVerificationSessionMap.set(
			emailVerificationSessionId,
			emailVerificationSession,
		);

		// mock verifySessionSecret to return false
		sessionSecretServiceMock.verifySessionSecret = () => false;

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});
});
