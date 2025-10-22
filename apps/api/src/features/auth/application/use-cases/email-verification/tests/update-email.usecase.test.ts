import { beforeEach, describe, expect, it } from "vitest";
import { SessionSecretHasherMock } from "../../../../../../core/testing/mocks/system";
import {
	createAuthUserFixture,
	createEmailVerificationSessionFixture,
	createSessionFixture,
} from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	EmailVerificationSessionRepositoryMock,
	SessionRepositoryMock,
	createAuthUsersMap,
	createEmailVerificationSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { UpdateEmailUseCase } from "../update-email.usecase";

const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();
const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
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
	authUserRepository,
	sessionRepository,
	emailVerificationSessionRepository,
	sessionSecretHasher,
);

const { userIdentity, userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "old@example.com",
	},
});

describe("UpdateEmailUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		emailVerificationSessionMap.clear();
	});

	it("should change email successfully with valid verification code", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await updateEmailUseCase.execute("12345678", userIdentity, emailVerificationSession);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;
			expect(session.userId).toBe(userIdentity.id);
			expect(typeof sessionToken).toBe("string");
			expect(sessionToken.length).toBeGreaterThan(0);
		}

		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);

		const updatedUserIdentity = authUserMap.get(userIdentity.id);
		expect(updatedUserIdentity?.email).toBe("new@example.com");
		expect(updatedUserIdentity?.emailVerified).toBe(true);
	});

	it("should return EMAIL_ALREADY_REGISTERED error when new email is already taken by another user", async () => {
		const { userRegistration: anotherUserRegistration } = createAuthUserFixture({
			userRegistration: {
				email: "new@example.com",
			},
		});
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		authUserMap.set(anotherUserRegistration.id, anotherUserRegistration);

		const result = await updateEmailUseCase.execute("12345678", userIdentity, emailVerificationSession);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}
	});

	it("should return INVALID_VERIFICATION_CODE error when verification code is incorrect", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);

		const result = await updateEmailUseCase.execute("87654321", userIdentity, emailVerificationSession);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}
	});

	it("should allow changing to same email if user is changing their own email", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: "same@example.com",
				code: "12345678",
			},
		});

		authUserMap.set(userRegistration.id, { ...userRegistration, email: "same@example.com", emailVerified: false });

		const result = await updateEmailUseCase.execute("12345678", userIdentity, emailVerificationSession);

		expect(result.isErr).toBe(false);

		const updatedUserIdentity = authUserMap.get(userIdentity.id);
		expect(updatedUserIdentity?.email).toBe("same@example.com");
		expect(updatedUserIdentity?.emailVerified).toBe(true);
	});

	it("should create and save a new session on successful email change", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);

		const result = await updateEmailUseCase.execute("12345678", userIdentity, emailVerificationSession);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session } = result.value;
			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userIdentity.id);
		}
	});

	it("should delete existing sessions when creating new session", async () => {
		const { session: existingSession } = createSessionFixture({
			session: {
				userId: userIdentity.id,
			},
		});
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: "new@example.com",
				code: "12345678",
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		sessionMap.set(existingSession.id, existingSession);

		const result = await updateEmailUseCase.execute("12345678", userIdentity, emailVerificationSession);

		expect(result.isErr).toBe(false);

		expect(sessionMap.has(existingSession.id)).toBe(false);

		if (!result.isErr) {
			const { session } = result.value;
			expect(sessionMap.get(session.id)).toBeDefined();
		}
	});
});
