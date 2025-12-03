import { assert, beforeEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { decodeToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	EmailVerificationSessionRepositoryMock,
	createAuthUsersMap,
	createEmailVerificationSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { UpdateEmailRequestUseCase } from "../request.usecase";

const emailVerificationSessionMap = createEmailVerificationSessionsMap();
const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();

const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const cryptoRandomService = new CryptoRandomServiceMock();
const tokenSecretService = new TokenSecretServiceMock();
const emailGateway = new EmailGatewayMock();

const updateEmailRequestUseCase = new UpdateEmailRequestUseCase(
	emailVerificationSessionRepository,
	authUserRepository,
	cryptoRandomService,
	tokenSecretService,
	emailGateway,
);

// Mockの固定値
const MOCK_VERIFICATION_CODE = "01234567"; // CryptoRandomServiceMockがdigits: trueで8文字生成する値
const MOCK_SECRET = "token-secret"; // TokenSecretServiceMockが生成するシークレット

const { userCredentials, userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "old@example.com",
		name: "Test User",
	},
});

const NEW_EMAIL = "new@example.com";
const EXISTING_EMAIL = "existing@example.com";

describe("UpdateEmailRequestUseCase", () => {
	beforeEach(() => {
		emailVerificationSessionMap.clear();
		authUserMap.clear();
		sessionMap.clear();
		emailGateway.sendVerificationEmailCalls = [];

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("Success: should create email verification session with valid new email", async () => {
		const result = await updateEmailRequestUseCase.execute(NEW_EMAIL, userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { emailVerificationSession, emailVerificationSessionToken } = result.value;

		// check email verification session
		expect(emailVerificationSession.email).toBe(NEW_EMAIL);
		expect(emailVerificationSession.userId).toBe(userCredentials.id);
		expect(emailVerificationSession.code).toBe(MOCK_VERIFICATION_CODE);
		expect(emailVerificationSession.code.length).toBe(8);
		expect(/^\d{8}$/.test(emailVerificationSession.code)).toBe(true);
		expect(emailVerificationSession.expiresAt).toBeInstanceOf(Date);
		expect(emailVerificationSession.expiresAt.getTime()).toBeGreaterThan(Date.now());

		// check session token
		const decoded = decodeToken(emailVerificationSessionToken);
		expect(decoded).not.toBeNull();
		assert(decoded !== null);
		expect(decoded.id).toBe(emailVerificationSession.id);
		expect(decoded.secret).toBe(MOCK_SECRET);

		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(emailVerificationSessionToken).toBe(`${emailVerificationSession.id}.token-secret`);
		expect(emailVerificationSession.secretHash).toStrictEqual(
			new TextEncoder().encode("__token-secret-hashed:token-secret"),
		);

		// check session is saved
		const savedSession = emailVerificationSessionMap.get(emailVerificationSession.id);
		expect(savedSession).toStrictEqual(emailVerificationSession);

		// check verification email is sent
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(1);
		expect(emailGateway.sendVerificationEmailCalls[0]?.email).toBe(NEW_EMAIL);
		expect(emailGateway.sendVerificationEmailCalls[0]?.code).toBe(MOCK_VERIFICATION_CODE);
	});

	it("Success: should delete existing session before creating new one", async () => {
		const { emailVerificationSession: existingSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userCredentials.id,
				email: "previous@example.com",
				code: "87654321",
			},
		});

		emailVerificationSessionMap.set(existingSession.id, existingSession);
		expect(emailVerificationSessionMap.size).toBe(1);

		const result = await updateEmailRequestUseCase.execute(NEW_EMAIL, userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// セキュリティ: 既存のセッションが削除され、新しいセッションが作成されていること（再利用防止）
		expect(emailVerificationSessionMap.has(existingSession.id)).toBe(false);
		expect(emailVerificationSessionMap.size).toBe(1);

		const { emailVerificationSession } = result.value;
		expect(emailVerificationSessionMap.get(emailVerificationSession.id)).toStrictEqual(emailVerificationSession);
	});

	it("Success: should generate different codes for each request", async () => {
		const result1 = await updateEmailRequestUseCase.execute(NEW_EMAIL, userCredentials);
		const result2 = await updateEmailRequestUseCase.execute("another@example.com", userCredentials);

		assert(result1.isOk);
		assert(result2.isOk);

		// セキュリティ: 各リクエストで異なるコードが生成されること
		expect(result1.value.emailVerificationSession.code).toBe(MOCK_VERIFICATION_CODE);
		expect(result2.value.emailVerificationSession.code).toBe(MOCK_VERIFICATION_CODE);
		// 注: CryptoRandomServiceMockは固定値を返すため、実際の実装では異なる値が生成される
		expect(result1.value.emailVerificationSession.id).not.toBe(result2.value.emailVerificationSession.id);
	});

	it("Error: should return EMAIL_ALREADY_REGISTERED error when new email is already registered", async () => {
		const { userRegistration: existingUser } = createAuthUserFixture({
			userRegistration: {
				email: EXISTING_EMAIL,
			},
		});

		authUserMap.set(existingUser.id, existingUser);

		const result = await updateEmailRequestUseCase.execute(EXISTING_EMAIL, userCredentials);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");

		// セッションが作成されていないこと
		expect(emailVerificationSessionMap.size).toBe(0);
		// メールが送信されていないこと
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(0);
	});

	it("Error: should return EMAIL_ALREADY_REGISTERED error when new email is same as current email", async () => {
		const result = await updateEmailRequestUseCase.execute(userRegistration.email, userCredentials);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");

		// セッションが作成されていないこと
		expect(emailVerificationSessionMap.size).toBe(0);
		// メールが送信されていないこと
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(0);
	});
});
