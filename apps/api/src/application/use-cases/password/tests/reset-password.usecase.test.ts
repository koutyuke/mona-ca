import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createPasswordResetSession, createSession, createUser } from "../../../../domain/entities";
import { newGender, newPasswordResetSessionId, newSessionId, newUserId } from "../../../../domain/value-object";
import { PasswordServiceMock, SessionSecretServiceMock } from "../../../../tests/mocks";
import { PasswordResetSessionRepositoryMock } from "../../../../tests/mocks/repositories/password-reset-session.repository.mock";
import { SessionRepositoryMock } from "../../../../tests/mocks/repositories/session.repository.mock";
import {
	createPasswordResetSessionsMap,
	createSessionsMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { ResetPasswordUseCase } from "../reset-password.usecase";

describe("ResetPasswordUseCase", () => {
	let resetPasswordUseCase: ResetPasswordUseCase;
	let userRepositoryMock: UserRepositoryMock;
	let sessionRepositoryMock: SessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;
	let passwordResetSessionRepositoryMock: PasswordResetSessionRepositoryMock;
	let passwordServiceMock: PasswordServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const userPasswordHashMap = new Map();
		const sessionMap = createSessionsMap();
		const passwordResetSessionMap = createPasswordResetSessionsMap();

		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		sessionRepositoryMock = new SessionRepositoryMock({
			sessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();
		passwordResetSessionRepositoryMock = new PasswordResetSessionRepositoryMock({
			passwordResetSessionMap,
		});
		passwordServiceMock = new PasswordServiceMock();

		resetPasswordUseCase = new ResetPasswordUseCase(
			userRepositoryMock,
			sessionRepositoryMock,
			passwordResetSessionRepositoryMock,
			passwordServiceMock,
		);
	});

	it("should reset password successfully when email is verified", async () => {
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

		// create password reset session with verified email
		const sessionId = newPasswordResetSessionId(ulid());
		const code = "12345678";
		const sessionSecretServiceMock = new SessionSecretServiceMock();
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		// set email as verified
		session.emailVerified = true;

		const newPassword = "new_password123";
		const result = await resetPasswordUseCase.execute(newPassword, session, user);

		expect(isErr(result)).toBe(false);

		// verify password was hashed and saved
		const savedUser = userRepositoryMock.userMap.get(userId);
		expect(savedUser).toBeDefined();
		expect(savedUser?.id).toBe(userId);
	});

	it("should return REQUIRED_EMAIL_VERIFICATION error when email is not verified", async () => {
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

		// create password reset session with unverified email
		const sessionId = newPasswordResetSessionId(ulid());
		const code = "12345678";
		const sessionSecretServiceMock = new SessionSecretServiceMock();
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		// set email as not verified
		session.emailVerified = false;

		const newPassword = "new_password123";
		const result = await resetPasswordUseCase.execute(newPassword, session, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("REQUIRED_EMAIL_VERIFICATION");
		}
	});

	it("should hash password before saving", async () => {
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

		// create password reset session with verified email
		const sessionId = newPasswordResetSessionId(ulid());
		const code = "12345678";
		const sessionSecretServiceMock = new SessionSecretServiceMock();
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const sessionSecretHash = sessionSecretServiceMock.hashSessionSecret(sessionSecret);
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: code,
			secretHash: sessionSecretHash,
			email: user.email,
		});

		// set email as verified
		session.emailVerified = true;

		const newPassword = "new_password123";
		const result = await resetPasswordUseCase.execute(newPassword, session, user);

		expect(isErr(result)).toBe(false);

		// verify password was hashed
		const savedPasswordHash = userRepositoryMock.userPasswordHashMap.get(userId);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe(newPassword); // should be hashed
		expect(savedPasswordHash).toBe(await passwordServiceMock.hashPassword(newPassword)); // should match mock hash
	});

	it("should delete all user sessions after password reset", async () => {
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

		const sessionId1 = newSessionId(ulid());
		const sessionSecret1 = sessionSecretServiceMock.generateSessionSecret();
		const session1 = createSession({
			id: sessionId1,
			userId: userId,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret1),
		});

		sessionRepositoryMock.sessionMap.set(sessionId1, session1);

		// create password reset session with verified email
		const passwordResetSessionId = newPasswordResetSessionId(ulid());
		const passwordResetCode = "12345678";
		const passwordResetSessionSecretServiceMock = new SessionSecretServiceMock();
		const passwordResetSessionSecret = passwordResetSessionSecretServiceMock.generateSessionSecret();
		const passwordResetSession = createPasswordResetSession({
			id: passwordResetSessionId,
			userId: userId,
			code: passwordResetCode,
			secretHash: passwordResetSessionSecretServiceMock.hashSessionSecret(passwordResetSessionSecret),
			email: user.email,
		});

		// set email as verified
		passwordResetSession.emailVerified = true;

		const newPassword = "new_password123";
		const result = await resetPasswordUseCase.execute(newPassword, passwordResetSession, user);

		expect(isErr(result)).toBe(false);

		expect(sessionRepositoryMock.sessionMap.has(sessionId1)).toBe(false);
	});

	it("should delete password reset sessions for the user", async () => {
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

		// create password reset session with verified email
		const sessionId = newPasswordResetSessionId(ulid());
		const code = "12345678";
		const sessionSecretServiceMock = new SessionSecretServiceMock();
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		// set email as verified
		session.emailVerified = true;

		// add session to repository
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		// add another session for the same user
		const anotherSessionId = newPasswordResetSessionId(ulid());
		const anotherSession = createPasswordResetSession({
			id: anotherSessionId,
			userId: userId,
			code: "87654321",
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(anotherSessionId, anotherSession);

		const newPassword = "new_password123";
		const result = await resetPasswordUseCase.execute(newPassword, session, user);

		expect(isErr(result)).toBe(false);

		// verify password reset sessions were deleted
		expect(passwordResetSessionRepositoryMock.passwordResetSessionMap.has(sessionId)).toBe(false);
		expect(passwordResetSessionRepositoryMock.passwordResetSessionMap.has(anotherSessionId)).toBe(false);
	});

	it("should save user with new password hash", async () => {
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

		// create password reset session with verified email
		const sessionId = newPasswordResetSessionId(ulid());
		const code = "12345678";
		const sessionSecretServiceMock = new SessionSecretServiceMock();
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: user.email,
		});

		// set email as verified
		session.emailVerified = true;

		const newPassword = "new_password123";
		const result = await resetPasswordUseCase.execute(newPassword, session, user);

		expect(isErr(result)).toBe(false);

		// verify user was saved
		const savedUser = userRepositoryMock.userMap.get(userId);
		expect(savedUser).toBeDefined();
		expect(savedUser?.id).toBe(userId);
		expect(savedUser?.email).toBe(user.email);

		// verify password hash was saved
		const savedPasswordHash = userRepositoryMock.userPasswordHashMap.get(userId);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe(newPassword); // should be hashed
		expect(savedPasswordHash).toBe(await passwordServiceMock.hashPassword(newPassword)); // should match mock hash
	});
});
