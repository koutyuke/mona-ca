import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createEmailVerificationSession, createUser } from "../../../../domain/entities";
import { newEmailVerificationSessionId, newGender, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { EmailVerificationSessionRepositoryMock } from "../../../../tests/mocks/repositories/email-verification-session.repository.mock";
import {
	createEmailVerificationSessionsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { EmailVerificationRequestUseCase } from "../email-verification-request.usecase";

describe("EmailVerificationRequestUseCase", () => {
	let emailVerificationRequestUseCase: EmailVerificationRequestUseCase;
	let userRepositoryMock: UserRepositoryMock;
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
		emailVerificationSessionRepositoryMock = new EmailVerificationSessionRepositoryMock({
			emailVerificationSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
			userRepositoryMock,
			emailVerificationSessionRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should create email verification request successfully for new email", async () => {
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

		userRepositoryMock.userMap.set(userId, user);

		const newEmail = "new@example.com";
		const result = await emailVerificationRequestUseCase.execute(newEmail, user);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("emailVerificationSession");
		expect(result).toHaveProperty("emailVerificationSessionToken");

		if (!isErr(result)) {
			expect(result.emailVerificationSession.email).toBe(newEmail);
			expect(result.emailVerificationSession.userId).toBe(userId);
			expect(result.emailVerificationSession.code).toBeDefined();
			expect(result.emailVerificationSession.code.length).toBe(8);
			expect(typeof result.emailVerificationSessionToken).toBe("string");
			expect(result.emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should create email verification request successfully for unverified current email", async () => {
		// create user with unverified email
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		userRepositoryMock.userMap.set(userId, user);

		const result = await emailVerificationRequestUseCase.execute("test@example.com", user);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("emailVerificationSession");
		expect(result).toHaveProperty("emailVerificationSessionToken");

		if (!isErr(result)) {
			expect(result.emailVerificationSession.email).toBe("test@example.com");
			expect(result.emailVerificationSession.userId).toBe(userId);
		}
	});

	it("should return EMAIL_ALREADY_VERIFIED error when trying to verify already verified email", async () => {
		// create user with verified email
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		userRepositoryMock.userMap.set(userId, user);

		const result = await emailVerificationRequestUseCase.execute("test@example.com", user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_ALREADY_VERIFIED");
		}
	});

	it("should return EMAIL_ALREADY_REGISTERED error when email is already used by another user", async () => {
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
			email: "existing@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("woman"),
		});

		userRepositoryMock.userMap.set(userId, user);
		userRepositoryMock.userMap.set(anotherUserId, anotherUser);

		const result = await emailVerificationRequestUseCase.execute("existing@example.com", user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}
	});

	it("should delete existing email verification sessions before creating new one", async () => {
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

		const existingEmailVerificationSecret = sessionSecretServiceMock.generateSessionSecret();
		const existingEmailVerificationSecretHash = sessionSecretServiceMock.hashSessionSecret(
			existingEmailVerificationSecret,
		);
		const existingEmailVerificationSessionId = newEmailVerificationSessionId(ulid());
		const existingEmailVerificationSession = createEmailVerificationSession({
			id: existingEmailVerificationSessionId,
			email: "test@example.com",
			userId: userId,
			code: "12345678",
			secretHash: existingEmailVerificationSecretHash,
		});

		userRepositoryMock.userMap.set(userId, user);
		emailVerificationSessionRepositoryMock.emailVerificationSessionMap.set(
			existingEmailVerificationSessionId,
			existingEmailVerificationSession,
		);

		expect(emailVerificationSessionRepositoryMock.emailVerificationSessionMap.size).toBe(1);
		expect(
			emailVerificationSessionRepositoryMock.emailVerificationSessionMap.get(existingEmailVerificationSessionId),
		).toBeDefined();

		const newEmail = "new@example.com";
		const result = await emailVerificationRequestUseCase.execute(newEmail, user);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			// verify session is saved
			const savedSession = emailVerificationSessionRepositoryMock.emailVerificationSessionMap.get(
				result.emailVerificationSession.id,
			);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
			expect(savedSession?.email).toBe(newEmail);
		}
	});

	it("should generate 8-digit numeric verification code", async () => {
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

		userRepositoryMock.userMap.set(userId, user);

		const newEmail = "new@example.com";
		const result = await emailVerificationRequestUseCase.execute(newEmail, user);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const code = result.emailVerificationSession.code;
			expect(code).toBeDefined();
			expect(code.length).toBe(8);
			expect(/^\d{8}$/.test(code)).toBe(true); // verify it's 8 digits
		}
	});

	it("should create session token with correct format", async () => {
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

		userRepositoryMock.userMap.set(userId, user);

		const newEmail = "new@example.com";
		const result = await emailVerificationRequestUseCase.execute(newEmail, user);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.emailVerificationSessionToken).toBe("string");
			expect(result.emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});
});
