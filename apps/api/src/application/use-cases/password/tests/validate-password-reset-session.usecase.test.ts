import { beforeEach, describe, expect, it } from "vitest";
import { createPasswordResetSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	PasswordResetSessionRepositoryMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
	createPasswordResetSessionsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { ValidatePasswordResetSessionUseCase } from "../validate-password-reset-session.usecase";

const passwordResetSessionMap = createPasswordResetSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const sessionMap = createSessionsMap();

const passwordResetSessionRepository = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();

const validatePasswordResetSessionUseCase = new ValidatePasswordResetSessionUseCase(
	passwordResetSessionRepository,
	userRepository,
	sessionSecretHasher,
);

const { user } = createUserFixture({
	user: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("ValidatePasswordResetSessionUseCase", () => {
	beforeEach(() => {
		passwordResetSessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();
		sessionMap.clear();
	});

	it("should validate password reset session successfully with valid token", async () => {
		const { passwordResetSession, passwordResetSessionToken } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
			},
		});

		userMap.set(user.id, user);
		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await validatePasswordResetSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession, user } = result.value;
			expect(passwordResetSession.id).toBe(passwordResetSession.id);
			expect(passwordResetSession.userId).toBe(user.id);
			expect(user.id).toBe(user.id);
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

		userMap.set(user.id, user);
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

		userMap.set(user.id, user);
		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await validatePasswordResetSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("PASSWORD_RESET_SESSION_EXPIRED");
		}

		expect(passwordResetSessionMap.has(passwordResetSession.id)).toBe(false);
	});
});
