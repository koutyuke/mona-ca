import { beforeEach, describe, expect, it } from "vitest";
import {
	createEmailVerificationSessionFixture,
	createSessionFixture,
	createUserFixture,
} from "../../../../tests/fixtures";
import {
	EmailVerificationSessionRepositoryMock,
	SessionRepositoryMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
} from "../../../../tests/mocks";
import {
	createEmailVerificationSessionsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { EmailVerificationConfirmUseCase } from "../email-verification-confirm.usecase";

const userMap = createUsersMap();
const sessionMap = createSessionsMap();
const userPasswordHashMap = createUserPasswordHashMap();
const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();

const emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
	userRepository,
	sessionRepository,
	emailVerificationSessionRepository,
	sessionSecretHasher,
);

const { user } = createUserFixture({
	user: {
		name: "test_user",
		email: "test@example.com",
	},
});

describe("EmailVerificationConfirmUseCase", () => {
	beforeEach(() => {
		userMap.clear();
		sessionMap.clear();
		userPasswordHashMap.clear();
		emailVerificationSessionMap.clear();

		userMap.set(user.id, user);
	});

	it("should confirm email verification successfully with valid code", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: user.email,
			},
		});

		userMap.set(user.id, user);
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationConfirmUseCase.execute(
			emailVerificationSession.code,
			user,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;
			expect(session.userId).toBe(user.id);
			expect(typeof sessionToken).toBe("string");
			expect(sessionToken.length).toBeGreaterThan(0);
		}

		// verify email verification session is deleted
		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);

		// verify user email is verified
		const updatedUser = userMap.get(user.id);
		expect(updatedUser?.emailVerified).toBe(true);
	});

	it("should return EMAIL_MISMATCH error when email addresses do not match", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: "different@example.com",
			},
		});

		const result = await emailVerificationConfirmUseCase.execute(
			emailVerificationSession.code,
			user,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_MISMATCH");
		}
	});

	it("should return INVALID_VERIFICATION_CODE error when verification code is incorrect", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: user.email,
			},
		});

		const wrongCode = "87654321";
		const result = await emailVerificationConfirmUseCase.execute(wrongCode, user, emailVerificationSession);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}
	});

	it("should delete all existing sessions before creating new session", async () => {
		// create existing sessions
		const { session: existingSession1 } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		const { session: existingSession2 } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		sessionMap.set(existingSession1.id, existingSession1);
		sessionMap.set(existingSession2.id, existingSession2);

		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: user.email,
			},
		});

		const result = await emailVerificationConfirmUseCase.execute(
			emailVerificationSession.code,
			user,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(false);

		// verify existing sessions are deleted
		expect(sessionMap.has(existingSession1.id)).toBe(false);
		expect(sessionMap.has(existingSession2.id)).toBe(false);

		// verify new session is created
		if (!result.isErr) {
			const { session } = result.value;
			const newSession = sessionMap.get(session.id);
			expect(newSession).toBeDefined();
			expect(newSession?.userId).toBe(user.id);
		}
	});

	it("should create and save a new session on successful email verification", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: user.email,
			},
		});

		const result = await emailVerificationConfirmUseCase.execute(
			emailVerificationSession.code,
			user,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session } = result.value;
			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
		}
	});
});
