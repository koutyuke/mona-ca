import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createEmailVerificationSession, createUser } from "../../../../domain/entities";
import { newEmailVerificationSessionId, newGender, newUserId } from "../../../../domain/value-object";
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
import { ChangeEmailUseCase } from "../change-email.usecase";

describe("ChangeEmailUseCase", () => {
	let changeEmailUseCase: ChangeEmailUseCase;
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

		changeEmailUseCase = new ChangeEmailUseCase(
			userRepositoryMock,
			sessionRepositoryMock,
			emailVerificationSessionRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should change email successfully with valid verification code", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "old@example.com",
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
			email: "new@example.com",
			code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);
		emailVerificationSessionRepositoryMock.emailVerificationSessionMap.set(
			emailVerificationSessionId,
			emailVerificationSession,
		);

		const result = await changeEmailUseCase.execute(code, user, emailVerificationSession);

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

		// verify user email is updated and verified
		const updatedUser = userRepositoryMock.userMap.get(userId);
		expect(updatedUser?.email).toBe("new@example.com");
		expect(updatedUser?.emailVerified).toBe(true);
	});

	it("should return EMAIL_ALREADY_REGISTERED error when new email is already taken by another user", async () => {
		// create user who wants to change email
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "old@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create another user with the email that the first user wants to change to
		const anotherUserId = newUserId(ulid());
		const anotherUser = createUser({
			id: anotherUserId,
			name: "another_user",
			email: "new@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("woman"),
		});

		// create email verification session
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "new@example.com",
			code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.userMap.set(anotherUserId, anotherUser);

		const result = await changeEmailUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}
	});

	it("should return INVALID_VERIFICATION_CODE error when verification code is incorrect", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "old@example.com",
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
			email: "new@example.com",
			code: correctCode,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);

		const wrongCode = "87654321";
		const result = await changeEmailUseCase.execute(wrongCode, user, emailVerificationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}
	});

	it("should allow changing to same email if user is changing their own email", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "same@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		// create email verification session for the same email
		const emailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const code = "12345678";
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const emailVerificationSession = createEmailVerificationSession({
			id: emailVerificationSessionId,
			userId: userId,
			email: "same@example.com",
			code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);

		const result = await changeEmailUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		// verify user email is verified
		const updatedUser = userRepositoryMock.userMap.get(userId);
		expect(updatedUser?.email).toBe("same@example.com");
		expect(updatedUser?.emailVerified).toBe(true);
	});

	it("should create and save a new session on successful email change", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "old@example.com",
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
			email: "new@example.com",
			code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
		});

		userRepositoryMock.userMap.set(userId, user);

		const result = await changeEmailUseCase.execute(code, user, emailVerificationSession);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
		}
	});
});
