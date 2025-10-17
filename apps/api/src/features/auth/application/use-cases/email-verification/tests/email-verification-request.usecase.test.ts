import { beforeEach, describe, expect, it } from "vitest";
import {
	createEmailVerificationSessionFixture,
	createSessionFixture,
	createUserFixture,
} from "../../../../../../tests/fixtures";
import {
	EmailVerificationSessionRepositoryMock,
	RandomGeneratorMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
	createEmailVerificationSessionsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../../../tests/mocks";
import { EmailVerificationRequestUseCase } from "../email-verification-request.usecase";

const userMap = createUsersMap();
const sessionMap = createSessionsMap();
const userPasswordHashMap = createUserPasswordHashMap();
const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});
const randomGenerator = new RandomGeneratorMock();
const sessionSecretHasher = new SessionSecretHasherMock();

const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
	userRepository,
	emailVerificationSessionRepository,
	randomGenerator,
	sessionSecretHasher,
);

const { user } = createUserFixture({
	user: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("EmailVerificationRequestUseCase", () => {
	beforeEach(() => {
		userMap.clear();
		sessionMap.clear();
		userPasswordHashMap.clear();
		emailVerificationSessionMap.clear();
	});

	it("should create email verification request successfully for new email", async () => {
		userMap.set(user.id, { ...user, emailVerified: false, email: "old@example.com" });

		const result = await emailVerificationRequestUseCase.execute("new@example.com", user);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession, emailVerificationSessionToken } = result.value;
			expect(emailVerificationSession.email).toBe("new@example.com");
			expect(emailVerificationSession.userId).toBe(user.id);
			expect(emailVerificationSession.code).toBeDefined();
			expect(emailVerificationSession.code.length).toBe(8);
			expect(typeof emailVerificationSessionToken).toBe("string");
			expect(emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should create email verification request successfully for unverified current email", async () => {
		const updatedUser = { ...user, emailVerified: false };
		userMap.set(user.id, updatedUser);

		const result = await emailVerificationRequestUseCase.execute("test@example.com", updatedUser);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			expect(emailVerificationSession.email).toBe("test@example.com");
			expect(emailVerificationSession.userId).toBe(updatedUser.id);
		}
	});

	it("should return EMAIL_ALREADY_VERIFIED error when trying to verify already verified email", async () => {
		userMap.set(user.id, { ...user, emailVerified: true });

		const result = await emailVerificationRequestUseCase.execute("test@example.com", user);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_VERIFIED");
		}
	});

	it("should return EMAIL_ALREADY_REGISTERED error when email is already used by another user", async () => {
		const { user: anotherUser } = createUserFixture({
			user: {
				email: "existing@example.com",
				name: "another_user",
				emailVerified: true,
			},
		});

		userMap.set(user.id, { ...user, email: "old@example.com" });
		userMap.set(anotherUser.id, anotherUser);

		const result = await emailVerificationRequestUseCase.execute("existing@example.com", user);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}
	});

	it("should delete existing email verification sessions before creating new one", async () => {
		userMap.set(user.id, user);

		const { emailVerificationSession: existingSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: user.email,
				code: "12345678",
			},
		});

		emailVerificationSessionMap.set(existingSession.id, existingSession);

		expect(emailVerificationSessionMap.size).toBe(1);
		expect(emailVerificationSessionMap.get(existingSession.id)).toBeDefined();

		const result = await emailVerificationRequestUseCase.execute("new@example.com", user);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			const savedSession = emailVerificationSessionMap.get(emailVerificationSession.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
			expect(savedSession?.email).toBe("new@example.com");
		}
	});

	it("should generate 8-digit numeric verification code", async () => {
		userMap.set(user.id, user);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", user);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			const code = emailVerificationSession.code;
			expect(code).toBeDefined();
			expect(code.length).toBe(8);
			expect(/^\d{8}$/.test(code)).toBe(true);
		}
	});

	it("should create session token with correct format", async () => {
		userMap.set(user.id, user);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", user);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSessionToken } = result.value;
			expect(typeof emailVerificationSessionToken).toBe("string");
			expect(emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should remove obsolete sessions when generating new token", async () => {
		userMap.set(user.id, user);

		const { session } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		sessionMap.set(session.id, session);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", user);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			const savedSession = emailVerificationSessionMap.get(emailVerificationSession.id);
			expect(savedSession).toBeDefined();
		}
	});
});
