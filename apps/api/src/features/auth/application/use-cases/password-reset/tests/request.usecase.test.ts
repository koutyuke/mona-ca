import { assert, beforeEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createAuthUserFixture, createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	PasswordResetSessionRepositoryMock,
	createAuthUsersMap,
	createPasswordResetSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { PasswordResetRequestUseCase } from "../request.usecase";

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
const cryptoRandomService = new CryptoRandomServiceMock();
const emailGateway = new EmailGatewayMock();
const tokenSecretService = new TokenSecretServiceMock();

const passwordResetRequestUseCase = new PasswordResetRequestUseCase(
	authUserRepository,
	passwordResetSessionRepository,
	cryptoRandomService,
	emailGateway,
	tokenSecretService,
);

const { userRegistration: user } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("PasswordResetRequestUseCase", () => {
	beforeEach(() => {
		passwordResetSessionMap.clear();
		authUserMap.clear();
		sessionMap.clear();
		emailGateway.sendVerificationEmailCalls = [];

		authUserMap.set(user.id, user);
	});

	it("Success: should create password reset session with valid user email", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { passwordResetSession, passwordResetSessionToken } = result.value;

		// セッションの基本情報
		expect(passwordResetSession.userId).toBe(user.id);
		expect(passwordResetSession.email).toBe(user.email);
		expect(passwordResetSession.emailVerified).toBe(false);

		// 8桁の数字コードが生成されること
		expect(passwordResetSession.code).toBeDefined();
		expect(passwordResetSession.code.length).toBe(8);
		expect(/^\d{8}$/.test(passwordResetSession.code)).toBe(true);

		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(passwordResetSessionToken).toBe(`${passwordResetSession.id}.token-secret`);
		expect(passwordResetSession.secretHash).toStrictEqual(
			new TextEncoder().encode("__token-secret-hashed:token-secret"),
		);

		// セッションが保存されていること
		const savedSession = passwordResetSessionMap.get(passwordResetSession.id);
		expect(savedSession).toStrictEqual(passwordResetSession);

		// メールが送信されていること
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(1);
		expect(emailGateway.sendVerificationEmailCalls[0]?.email).toBe(user.email);
		expect(emailGateway.sendVerificationEmailCalls[0]?.code).toBe(passwordResetSession.code);
	});

	it("Success: should delete all existing password reset sessions before creating new one", async () => {
		const { passwordResetSession: existingSession1 } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});
		const { passwordResetSession: existingSession2 } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				code: "87654321",
				email: user.email,
			},
		});

		passwordResetSessionMap.set(existingSession1.id, existingSession1);
		passwordResetSessionMap.set(existingSession2.id, existingSession2);

		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// 既存のセッションが削除されていること（セキュリティ: 古いセッションの再利用を防ぐ）
		expect(passwordResetSessionMap.has(existingSession1.id)).toBe(false);
		expect(passwordResetSessionMap.has(existingSession2.id)).toBe(false);

		// 新しいセッションが作成されていること
		const { passwordResetSession } = result.value;
		const newSession = passwordResetSessionMap.get(passwordResetSession.id);
		expect(newSession).toBeDefined();
		assert(newSession);
		expect(newSession.userId).toBe(user.id);
		expect(newSession.email).toBe(user.email);
	});

	it("Error: should return USER_NOT_FOUND error for non-existent user", async () => {
		authUserMap.clear();
		const result = await passwordResetRequestUseCase.execute("nonexistent@example.com");

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("USER_NOT_FOUND");

		// セッションが作成されていないこと
		expect(passwordResetSessionMap.size).toBe(0);
		// メールが送信されていないこと
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(0);
	});

	it("Error: should return USER_NOT_FOUND error for empty email", async () => {
		const result = await passwordResetRequestUseCase.execute("");

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("USER_NOT_FOUND");
	});

	it("Error: should return USER_NOT_FOUND error for case insensitive email mismatch", async () => {
		const uppercaseEmail = "TEST@EXAMPLE.COM";
		const result = await passwordResetRequestUseCase.execute(uppercaseEmail);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("USER_NOT_FOUND");
	});
});
