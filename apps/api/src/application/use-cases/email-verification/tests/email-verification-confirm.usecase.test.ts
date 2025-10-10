import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import {
	type EmailVerificationSession,
	type Session,
	type User,
	createEmailVerificationSession,
	createSession,
	createUser,
} from "../../../../domain/entities";
import {
	type EmailVerificationSessionId,
	type SessionId,
	type UserId,
	newEmailVerificationSessionId,
	newGender,
	newSessionId,
	newUserId,
} from "../../../../domain/value-object";
import { generateSessionSecret, hashSessionSecret } from "../../../../infrastructure/crypt";
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

	let userMap: Map<UserId, User>;
	let sessionMap: Map<SessionId, Session>;
	let userPasswordHashMap: Map<UserId, string>;
	let emailVerificationSessionMap: Map<EmailVerificationSessionId, EmailVerificationSession>;

	beforeEach(() => {
		userMap = createUsersMap();
		sessionMap = createSessionsMap();
		userPasswordHashMap = createUserPasswordHashMap();
		emailVerificationSessionMap = createEmailVerificationSessionsMap();

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

		emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
			userRepositoryMock,
			sessionRepositoryMock,
			emailVerificationSessionRepositoryMock,
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
		const sessionSecret = generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code,
			secretHash: hashSessionSecret(sessionSecret),
		});

		userMap.set(userId, user);
		emailVerificationSessionMap.set(emailVerificationSessionId, emailVerificationSession);

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
		expect(emailVerificationSessionMap.has(emailVerificationSessionId)).toBe(false);

		// verify user email is verified
		const updatedUser = userMap.get(userId);
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
		const sessionSecret = generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "different@example.com",
			code,
			secretHash: hashSessionSecret(sessionSecret),
		});

		userMap.set(userId, user);

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
		const sessionSecret = generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code: correctCode,
			secretHash: hashSessionSecret(sessionSecret),
		});

		userMap.set(userId, user);

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
		const sessionSecret1 = generateSessionSecret();
		const existingSession1 = createSession({
			id: existingSessionId1,
			userId: userId,
			secretHash: hashSessionSecret(sessionSecret1),
		});

		const existingSessionId2 = newSessionId(ulid());
		const sessionSecret2 = generateSessionSecret();
		const existingSession2 = createSession({
			id: existingSessionId2,
			userId: userId,
			secretHash: hashSessionSecret(sessionSecret2),
		});

		sessionMap.set(existingSessionId1, existingSession1);
		sessionMap.set(existingSessionId2, existingSession2);

		// create email verification session
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const code = "12345678";
		const sessionSecret = generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code,
			secretHash: hashSessionSecret(sessionSecret),
		});

		userMap.set(userId, user);

		const result = await emailVerificationConfirmUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(false);

		// verify existing sessions are deleted
		expect(sessionMap.has(existingSessionId1)).toBe(false);
		expect(sessionMap.has(existingSessionId2)).toBe(false);

		// verify new session is created
		if (!isErr(result)) {
			const newSession = sessionMap.get(result.session.id);
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
		const sessionSecret = generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "test@example.com",
			code,
			secretHash: hashSessionSecret(sessionSecret),
		});

		userMap.set(userId, user);

		const result = await emailVerificationConfirmUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
		}
	});
});
