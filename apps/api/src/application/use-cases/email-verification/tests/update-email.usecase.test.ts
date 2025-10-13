import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
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
	createEmailVerificationSessionsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { UpdateEmailUseCase } from "../update-email.usecase";

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

const updateEmailUseCase = new UpdateEmailUseCase(
	userRepository,
	sessionRepository,
	emailVerificationSessionRepository,
	sessionSecretHasher,
);

const { user } = createUserFixture({
	user: {
		email: "old@example.com",
		name: "test_user",
	},
});

describe("UpdateEmailUseCase", () => {
	beforeEach(() => {
		userMap.clear();
		sessionMap.clear();
		userPasswordHashMap.clear();
		emailVerificationSessionMap.clear();
	});

	it("should change email successfully with valid verification code", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		userMap.set(user.id, user);
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await updateEmailUseCase.execute("12345678", user, emailVerificationSession);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(user.id);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}

		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);

		const updatedUser = userMap.get(user.id);
		expect(updatedUser?.email).toBe("new@example.com");
		expect(updatedUser?.emailVerified).toBe(true);
	});

	it("should return EMAIL_ALREADY_REGISTERED error when new email is already taken by another user", async () => {
		const { user: anotherUser } = createUserFixture({
			user: {
				email: "new@example.com",
				name: "another_user",
			},
		});
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		userMap.set(user.id, user);
		userMap.set(anotherUser.id, anotherUser);

		const result = await updateEmailUseCase.execute("12345678", user, emailVerificationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}
	});

	it("should return INVALID_VERIFICATION_CODE error when verification code is incorrect", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		userMap.set(user.id, user);

		const result = await updateEmailUseCase.execute("87654321", user, emailVerificationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}
	});

	it("should allow changing to same email if user is changing their own email", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: "same@example.com",
				code: "12345678",
			},
		});

		userMap.set(user.id, { ...user, email: "same@example.com", emailVerified: false });

		const result = await updateEmailUseCase.execute("12345678", user, emailVerificationSession);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		const updatedUser = userMap.get(user.id);
		expect(updatedUser?.email).toBe("same@example.com");
		expect(updatedUser?.emailVerified).toBe(true);
	});

	it("should create and save a new session on successful email change", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		userMap.set(user.id, user);

		const result = await updateEmailUseCase.execute("12345678", user, emailVerificationSession);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
		}
	});

	it("should delete existing sessions when creating new session", async () => {
		const { session: existingSession } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		userMap.set(user.id, user);
		sessionMap.set(existingSession.id, existingSession);

		const result = await updateEmailUseCase.execute("12345678", user, emailVerificationSession);

		expect(isErr(result)).toBe(false);

		expect(sessionMap.has(existingSession.id)).toBe(false);

		if (!isErr(result)) {
			expect(sessionMap.get(result.session.id)).toBeDefined();
		}
	});
});
