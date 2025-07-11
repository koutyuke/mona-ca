import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createEmailVerificationSession, createSession, createUser } from "../../../../domain/entities";
import { newEmailVerificationSessionId, newGender, newSessionId, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { EmailVerificationSessionRepositoryMock } from "../../../../tests/mocks/repositories/email-verification-session.repository.mock";
import { SessionRepositoryMock } from "../../../../tests/mocks/repositories/session.repository.mock";
import {
	createEmailVerificationSessionsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { EmailVerificationConfirmUseCase } from "../email-verification-confirm.usecase";

describe("EmailVerificationConfirmUseCase", () => {
	let emailVerificationConfirmUseCase: EmailVerificationConfirmUseCase;
	let userRepositoryMock: UserRepositoryMock;
	let sessionRepositoryMock: SessionRepositoryMock;
	let emailVerificationSessionRepositoryMock: EmailVerificationSessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap();
		const emailVerificationSessionMap = createEmailVerificationSessionsMap();

		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		sessionRepositoryMock = new SessionRepositoryMock({
			sessionMap,
		});
		emailVerificationSessionRepositoryMock = new EmailVerificationSessionRepositoryMock({
			emailVerificationSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
			userRepositoryMock,
			sessionRepositoryMock,
			emailVerificationSessionRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should confirm email verification successfully with valid code", async () => {
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
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);
		emailVerificationSessionRepositoryMock.emailVerificationSessionMap.set(
			emailVerificationSessionId,
			emailVerificationSession,
		);

		const result = await emailVerificationConfirmUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(userId);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}

		// verify email verification session is deleted
		expect(emailVerificationSessionRepositoryMock.emailVerificationSessionMap.has(emailVerificationSessionId)).toBe(
			false,
		);

		// verify user email is verified
		const updatedUser = userRepositoryMock.userMap.get(userId);
		expect(updatedUser?.emailVerified).toBe(true);
	});

	it("should return EMAIL_MISMATCH error when email addresses do not match", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "user@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create email verification session with different email
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "different@example.com",
			code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);

		const result = await emailVerificationConfirmUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_MISMATCH");
		}
	});

	it("should return INVALID_VERIFICATION_CODE error when verification code is incorrect", async () => {
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
		const correctCode = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code: correctCode,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);

		const wrongCode = "87654321";
		const result = await emailVerificationConfirmUseCase.execute(wrongCode, user, emailVerificationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}
	});

	it("should delete all existing sessions before creating new session", async () => {
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

		// create existing sessions
		const existingSessionId1 = newSessionId(ulid());
		const sessionSecret1 = sessionSecretServiceMock.generateSessionSecret();
		const existingSession1 = createSession({
			id: existingSessionId1,
			userId: userId,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret1),
		});

		const existingSessionId2 = newSessionId(ulid());
		const sessionSecret2 = sessionSecretServiceMock.generateSessionSecret();
		const existingSession2 = createSession({
			id: existingSessionId2,
			userId: userId,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret2),
		});

		sessionRepositoryMock.sessionMap.set(existingSessionId1, existingSession1);
		sessionRepositoryMock.sessionMap.set(existingSessionId2, existingSession2);

		// create email verification session
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);

		const result = await emailVerificationConfirmUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(false);

		// verify existing sessions are deleted
		expect(sessionRepositoryMock.sessionMap.has(existingSessionId1)).toBe(false);
		expect(sessionRepositoryMock.sessionMap.has(existingSessionId2)).toBe(false);

		// verify new session is created
		if (!isErr(result)) {
			const newSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(newSession).toBeDefined();
			expect(newSession?.userId).toBe(userId);
		}
	});

	it("should create and save a new session on successful email verification", async () => {
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
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);

		const result = await emailVerificationConfirmUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
		}
	});
});
