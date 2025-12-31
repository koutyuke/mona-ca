import { afterEach, assert, beforeEach, describe, expect, it } from "vitest";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createAuthUserFixture, createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	createAuthUserMap,
	createPasswordResetSessionMap,
	createSessionMap,
	PasswordResetSessionRepositoryMock,
} from "../../../../testing/mocks/repositories";
import { PasswordResetValidateSessionUseCase } from "../validate-session.usecase";

const passwordResetSessionMap = createPasswordResetSessionMap();
const authUserMap = createAuthUserMap();
const sessionMap = createSessionMap();

const passwordResetSessionRepository = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const passwordResetValidateSessionUseCase = new PasswordResetValidateSessionUseCase(
	authUserRepository,
	passwordResetSessionRepository,
	tokenSecretService,
);

const { userRegistration: user } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("PasswordResetValidateSessionUseCase", () => {
	beforeEach(() => {
		authUserMap.set(user.id, user);
	});
	afterEach(() => {
		passwordResetSessionMap.clear();
		authUserMap.clear();
		sessionMap.clear();
	});

	it("Success: should validate password reset session with valid token and return session and user", async () => {
		const { passwordResetSession, passwordResetSessionToken } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
			},
		});

		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await passwordResetValidateSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { passwordResetSession: validatedSession, userCredentials } = result.value;

		expect(validatedSession.id).toBe(passwordResetSession.id);
		expect(validatedSession.userId).toBe(user.id);
		expect(validatedSession.email).toBe(user.email);
		expect(userCredentials.id).toBe(user.id);
		expect(userCredentials.email).toBe(user.email);

		// セッションが削除されていないこと
		expect(passwordResetSessionMap.has(passwordResetSession.id)).toBe(true);
	});

	it("Error: should return INVALID_PASSWORD_RESET_SESSION error for invalid token format", async () => {
		const invalidToken = "invalid_token_format" as never;

		const result = await passwordResetValidateSessionUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PASSWORD_RESET_SESSION");
	});

	it("Error: should return INVALID_PASSWORD_RESET_SESSION error for empty token", async () => {
		const result = await passwordResetValidateSessionUseCase.execute("" as never);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PASSWORD_RESET_SESSION");
	});

	it("Error: should return INVALID_PASSWORD_RESET_SESSION error for non-existent session", async () => {
		const { passwordResetSessionToken } = createPasswordResetSessionFixture();

		const result = await passwordResetValidateSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PASSWORD_RESET_SESSION");
	});

	it("Error: should return INVALID_PASSWORD_RESET_SESSION error and delete session when user does not exist", async () => {
		// clear auth user map to simulate user does not exist
		authUserMap.clear();

		const { passwordResetSession, passwordResetSessionToken } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
			},
		});

		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await passwordResetValidateSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PASSWORD_RESET_SESSION");

		// セキュリティ: 存在しないユーザーのセッションは削除されること
		expect(passwordResetSessionMap.has(passwordResetSession.id)).toBe(false);
	});

	it("Error: should return INVALID_PASSWORD_RESET_SESSION error for invalid session secret", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
			},
		});

		authUserMap.set(user.id, user);
		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await passwordResetValidateSessionUseCase.execute("invalid.secret.token" as never);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PASSWORD_RESET_SESSION");
	});

	it("Error: should return INVALID_PASSWORD_RESET_SESSION error when session email does not match user email", async () => {
		const { passwordResetSession, passwordResetSessionToken } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: "different@example.com",
			},
		});

		authUserMap.set(user.id, user);
		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await passwordResetValidateSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PASSWORD_RESET_SESSION");

		// セキュリティ: メールアドレスが一致しないセッションは削除されること
		expect(passwordResetSessionMap.has(passwordResetSession.id)).toBe(false);
	});

	it("Error: should return INVALID_PASSWORD_RESET_SESSION error and delete session for expired session", async () => {
		const { passwordResetSession, passwordResetSessionToken } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				expiresAt: new Date(Date.now() - 1000),
			},
		});

		authUserMap.set(user.id, user);
		passwordResetSessionMap.set(passwordResetSession.id, passwordResetSession);

		const result = await passwordResetValidateSessionUseCase.execute(passwordResetSessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PASSWORD_RESET_SESSION");

		// セキュリティ: 期限切れセッションは削除されること
		expect(passwordResetSessionMap.has(passwordResetSession.id)).toBe(false);
	});
});
