import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { createEmailVerificationSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	EmailVerificationSessionRepositoryMock,
	SessionSecretHasherMock,
	createEmailVerificationSessionsMap,
} from "../../../../tests/mocks";
import { ValidateEmailVerificationSessionUseCase } from "../validate-email-verification-session.usecase";

const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});

const sessionSecretHasher = new SessionSecretHasherMock();

const validateEmailVerificationSessionUseCase = new ValidateEmailVerificationSessionUseCase(
	emailVerificationSessionRepository,
	sessionSecretHasher,
);

const { user } = createUserFixture({
	user: {
		name: "test_user",
		email: "test@example.com",
	},
});

describe("ValidateEmailVerificationSessionUseCase", () => {
	beforeEach(() => {
		emailVerificationSessionMap.clear();
	});

	it("should validate email verification session successfully with valid token", async () => {
		const { emailVerificationSession, emailVerificationSessionToken } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: user.email,
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("emailVerificationSession");

		if (!isErr(result)) {
			expect(result.emailVerificationSession.id).toBe(emailVerificationSession.id);
			expect(result.emailVerificationSession.userId).toBe(user.id);
			expect(result.emailVerificationSession.email).toBe(user.email);
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when token format is invalid", async () => {
		const result = await validateEmailVerificationSessionUseCase.execute("invalid_token" as never, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when session does not exist", async () => {
		const { emailVerificationSessionToken } = createEmailVerificationSessionFixture();

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when user ID does not match", async () => {
		const { emailVerificationSession, emailVerificationSessionToken } = createEmailVerificationSessionFixture();

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_EXPIRED error and delete session when session is expired", async () => {
		const { emailVerificationSession, emailVerificationSessionToken } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: user.email,
				expiresAt: new Date(Date.now() - 1_000),
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_EXPIRED");
		}

		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when session secret is invalid", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
				email: user.email,
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await validateEmailVerificationSessionUseCase.execute("invalid.secret.token" as never, user);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});
});
