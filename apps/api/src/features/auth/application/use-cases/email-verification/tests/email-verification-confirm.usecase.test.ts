import { beforeEach, describe, expect, it } from "vitest";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	EmailVerificationSessionRepositoryMock,
	createAuthUserMap,
	createEmailVerificationSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationConfirmUseCase } from "../email-verification-confirm.usecase";

const authUserMap = createAuthUserMap();
const sessionMap = createSessionsMap();
const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});

const emailVerificationConfirmUseCase = new EmailVerificationConfirmUseCase(
	authUserRepository,
	emailVerificationSessionRepository,
);

const { userRegistration, userIdentity } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("EmailVerificationConfirmUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		emailVerificationSessionMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("should confirm email verification successfully with valid code", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationConfirmUseCase.execute(
			emailVerificationSession.code,
			userIdentity,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(false);

		// verify email verification session is deleted
		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);

		// verify user email is verified
		const updatedUserIdentity = authUserMap.get(userIdentity.id);
		expect(updatedUserIdentity?.emailVerified).toBe(true);
	});

	it("should return EMAIL_MISMATCH error when email addresses do not match", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: "different@example.com",
			},
		});

		const result = await emailVerificationConfirmUseCase.execute(
			emailVerificationSession.code,
			userIdentity,
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
				userId: userRegistration.id,
				email: userRegistration.email,
			},
		});

		const wrongCode = "87654321";
		const result = await emailVerificationConfirmUseCase.execute(wrongCode, userIdentity, emailVerificationSession);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}
	});
});
