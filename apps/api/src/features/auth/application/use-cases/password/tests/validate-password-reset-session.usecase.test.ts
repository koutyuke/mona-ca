import { beforeEach, describe, expect, it } from "vitest";
import { SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import { createAuthUserFixture, createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	PasswordResetSessionRepositoryMock,
	createAuthUsersMap,
	createPasswordResetSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { ValidatePasswordResetSessionUseCase } from "../validate-password-reset-session.usecase";

const passwordResetSessionMap = createPasswordResetSessionsMap();
const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();

const passwordResetSessionRepository = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();

const validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
	passwordResetSessionRepository,
	authUserRepository,
	sessionSecretHasher,
);

const { userRegistration: user } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("ValidatePasswordResetSessionUseCase", () => {
	beforeEach(() => {
		passwordResetSessionMap.clear();
		authUserMap.clear();
		sessionMap.clear();
	});

	it("should validate password reset session successfully with valid token", async () => {
		const { passwordResetSession, passwordResetSessionToken } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
			},
		});

		authUserMap.set(user.id, user);
		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await validatePasswordResetSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession, userIdentity } = result.value;
			expect(passwordResetSession.id).toBe(passwordResetSession.id);
			expect(passwordResetSession.userId).toBe(userIdentity.id);
			expect(userIdentity.id).toBe(user.id);
		}
	});

	it("should return PASSWORD_RESET_SESSION_INVALID error for invalid token format", async () => {
		const invalidToken = "invalid_token_format" as never;

		const result = await validatePasswordResetSessionUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_INVALID");
		}
	});

	it("should return PASSWORD_RESET_SESSION_INVALID error for non-existent session", async () => {
		const { passwordResetSessionToken } = createPasswordResetSessionFixture();
		const result = await validatePasswordResetSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_INVALID");
		}
	});

	it("should return PASSWORD_RESET_SESSION_INVALID error when user does not exist", async () => {
		const { passwordResetSession, passwordResetSessionToken } = createPasswordResetSessionFixture();

		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await validatePasswordResetSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_INVALID");
		}

		expect(passwordResetSessionMap.has(passwordResetSession.id)).toBe(false);
	});

	it("should return PASSWORD_RESET_SESSION_INVALID error for invalid session secret", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
			},
		});

		authUserMap.set(user.id, user);
		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await validatePasswordResetSessionUseCase.execute("invalid.secret.token" as never);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_INVALID");
		}
	});

	it("should return PASSWORD_RESET_SESSION_EXPIRED error for expired session", async () => {
		const { passwordResetSession, passwordResetSessionToken } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				expiresAt: new Date(Date.now() - 1000),
			},
		});

		authUserMap.set(user.id, user);
		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await validatePasswordResetSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_EXPIRED");
		}

		expect(passwordResetSessionMap.has(passwordResetSession.id)).toBe(false);
	});
});
