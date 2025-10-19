import { afterEach, describe, expect, it } from "vitest";
import { SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import { formatAnySessionToken } from "../../../../domain/value-objects/session-token";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import {
	EmailVerificationSessionRepositoryMock,
	createEmailVerificationSessionsMap,
} from "../../../../testing/mocks/repositories";
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

const { userIdentity } = createAuthUserFixture();

describe("ValidateEmailVerificationSessionUseCase", () => {
	afterEach(() => {
		emailVerificationSessionMap.clear();
	});

	it("should validate email verification session successfully with valid token", async () => {
		const { emailVerificationSession, emailVerificationSessionSecret } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: userIdentity.email,
				code: "12345678",
			},
		});
		const emailVerificationSessionToken = formatAnySessionToken(
			emailVerificationSession.id,
			emailVerificationSessionSecret,
		);

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await validateEmailVerificationSessionUseCase.execute(userIdentity, emailVerificationSessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession: validatedSession } = result.value;
			expect(validatedSession.id).toBe(emailVerificationSession.id);
			expect(validatedSession.userId).toBe(userIdentity.id);
			expect(validatedSession.email).toBe(userIdentity.email);
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when token format is invalid", async () => {
		const invalidToken = formatAnySessionToken(userIdentity.id as never, "invalid");

		const result = await validateEmailVerificationSessionUseCase.execute(userIdentity, invalidToken as never);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when session does not exist", async () => {
		const { emailVerificationSession, emailVerificationSessionSecret } = createEmailVerificationSessionFixture();
		const emailVerificationSessionToken = formatAnySessionToken(
			emailVerificationSession.id,
			emailVerificationSessionSecret,
		);

		const result = await validateEmailVerificationSessionUseCase.execute(userIdentity, emailVerificationSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when user ID does not match", async () => {
		const { emailVerificationSession, emailVerificationSessionSecret } = createEmailVerificationSessionFixture();
		const emailVerificationSessionToken = formatAnySessionToken(
			emailVerificationSession.id,
			emailVerificationSessionSecret,
		);

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await validateEmailVerificationSessionUseCase.execute(userIdentity, emailVerificationSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});

	it("should return EMAIL_VERIFICATION_SESSION_EXPIRED error and delete session when session is expired", async () => {
		const { emailVerificationSession, emailVerificationSessionSecret } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: userIdentity.email,
				expiresAt: new Date(Date.now() - 1_000),
			},
		});
		const emailVerificationSessionToken = formatAnySessionToken(
			emailVerificationSession.id,
			emailVerificationSessionSecret,
		);

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await validateEmailVerificationSessionUseCase.execute(userIdentity, emailVerificationSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_EXPIRED");
		}

		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);
	});

	it("should return EMAIL_VERIFICATION_SESSION_INVALID error when session secret is invalid", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: userIdentity.email,
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const invalidToken = formatAnySessionToken(emailVerificationSession.id, "invalid_secret");
		const result = await validateEmailVerificationSessionUseCase.execute(userIdentity, invalidToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
		}
	});
});
