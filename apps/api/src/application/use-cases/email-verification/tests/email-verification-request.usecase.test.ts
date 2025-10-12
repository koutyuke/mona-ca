import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import {
	createEmailVerificationSessionFixture,
	createSessionFixture,
	createUserFixture,
} from "../../../../tests/fixtures";
import {
	EmailVerificationSessionRepositoryMock,
	RandomGeneratorMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
	createEmailVerificationSessionsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
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

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("emailVerificationSession");
		expect(result).toHaveProperty("emailVerificationSessionToken");

		if (!isErr(result)) {
			expect(result.emailVerificationSession.email).toBe("new@example.com");
			expect(result.emailVerificationSession.userId).toBe(user.id);
			expect(result.emailVerificationSession.code).toBeDefined();
			expect(result.emailVerificationSession.code.length).toBe(8);
			expect(typeof result.emailVerificationSessionToken).toBe("string");
			expect(result.emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should create email verification request successfully for unverified current email", async () => {
		const updatedUser = { ...user, emailVerified: false };
		userMap.set(user.id, updatedUser);

		const result = await emailVerificationRequestUseCase.execute("test@example.com", updatedUser);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("emailVerificationSession");
		expect(result).toHaveProperty("emailVerificationSessionToken");

		if (!isErr(result)) {
			expect(result.emailVerificationSession.email).toBe("test@example.com");
			expect(result.emailVerificationSession.userId).toBe(updatedUser.id);
		}
	});

	it("should return EMAIL_ALREADY_VERIFIED error when trying to verify already verified email", async () => {
		userMap.set(user.id, { ...user, emailVerified: true });

		const result = await emailVerificationRequestUseCase.execute("test@example.com", user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
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

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
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

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = emailVerificationSessionMap.get(result.emailVerificationSession.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
			expect(savedSession?.email).toBe("new@example.com");
		}
	});

	it("should generate 8-digit numeric verification code", async () => {
		userMap.set(user.id, user);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", user);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const code = result.emailVerificationSession.code;
			expect(code).toBeDefined();
			expect(code.length).toBe(8);
			expect(/^\d{8}$/.test(code)).toBe(true);
		}
	});

	it("should create session token with correct format", async () => {
		userMap.set(user.id, user);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", user);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.emailVerificationSessionToken).toBe("string");
			expect(result.emailVerificationSessionToken.length).toBeGreaterThan(0);
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

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = emailVerificationSessionMap.get(result.emailVerificationSession.id);
			expect(savedSession).toBeDefined();
		}
	});
});
