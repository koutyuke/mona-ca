import { assert, beforeEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { decodeToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import {
	EmailVerificationSessionRepositoryMock,
	createEmailVerificationSessionsMap,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationInitiateUseCase } from "../initiate.usecase";

const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});

const cryptoRandomService = new CryptoRandomServiceMock();
const tokenSecretService = new TokenSecretServiceMock();
const emailGateway = new EmailGatewayMock();

const emailVerificationInitiateUseCase = new EmailVerificationInitiateUseCase(
	emailGateway,
	emailVerificationSessionRepository,
	cryptoRandomService,
	tokenSecretService,
);

// モックの固定値
const MOCK_VERIFICATION_CODE = "01234567"; // CryptoRandomServiceMockがdigits: trueで8文字生成する値
const MOCK_SECRET = "token-secret"; // TokenSecretServiceMockが生成するシークレット

const TEST_EMAIL = "test@example.com";
const TEST_NAME = "test_user";

const { userCredentials } = createAuthUserFixture({
	userRegistration: {
		email: TEST_EMAIL,
		name: TEST_NAME,
		emailVerified: false,
	},
});

describe("EmailVerificationInitiateUseCase", () => {
	beforeEach(() => {
		emailVerificationSessionMap.clear();
		emailGateway.sendVerificationEmailCalls = [];
	});

	it("Success: should create session and return token for unverified email address", async () => {
		const result = await emailVerificationInitiateUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { emailVerificationSession, emailVerificationSessionToken } = result.value;

		// セッションのプロパティを検証
		expect(emailVerificationSession.email).toBe(TEST_EMAIL);
		expect(emailVerificationSession.userId).toBe(userCredentials.id);
		expect(emailVerificationSession.code).toBe(MOCK_VERIFICATION_CODE);
		expect(emailVerificationSession.expiresAt).toBeInstanceOf(Date);
		expect(emailVerificationSession.expiresAt.getTime()).toBeGreaterThan(Date.now());

		// トークンのフォーマットを検証
		const decoded = decodeToken(emailVerificationSessionToken);
		expect(decoded).not.toBeNull();
		assert(decoded !== null);
		expect(decoded.id).toBe(emailVerificationSession.id);
		expect(decoded.secret).toBe(MOCK_SECRET);
	});

	it("Success: should save session to repository", async () => {
		const result = await emailVerificationInitiateUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationSession } = result.value;

		const savedSession = emailVerificationSessionMap.get(emailVerificationSession.id);
		expect(savedSession).toStrictEqual(emailVerificationSession);
	});

	it("Success: should send verification email with correct recipient and code", async () => {
		const result = await emailVerificationInitiateUseCase.execute(userCredentials);

		assert(result.isOk);

		expect(emailGateway.sendVerificationEmailCalls).toHaveLength(1);

		const emailCall = emailGateway.sendVerificationEmailCalls[0];
		expect(emailCall?.email).toBe(TEST_EMAIL);
		expect(emailCall?.code).toBe(MOCK_VERIFICATION_CODE);
	});

	it("Success: should delete existing session before creating new session", async () => {
		// 既存のセッションを作成
		const { emailVerificationSession: existingSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userCredentials.id,
				email: userCredentials.email,
				code: "87654321",
			},
		});
		emailVerificationSessionMap.set(existingSession.id, existingSession);

		expect(emailVerificationSessionMap.size).toBe(1);
		expect(emailVerificationSessionMap.get(existingSession.id)).toStrictEqual(existingSession);

		// 新しいセッションを作成
		const result = await emailVerificationInitiateUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// 古いセッションが削除されていること
		expect(emailVerificationSessionMap.has(existingSession.id)).toBe(false);

		// 新しいセッションのみが存在すること
		expect(emailVerificationSessionMap.size).toBe(1);
		const { emailVerificationSession } = result.value;
		expect(emailVerificationSessionMap.get(emailVerificationSession.id)).toStrictEqual(emailVerificationSession);
	});

	it("Success: should keep only the latest session when called multiple times consecutively", async () => {
		// 1回目
		const result1 = await emailVerificationInitiateUseCase.execute(userCredentials);
		assert(result1.isOk);
		const session1 = result1.value.emailVerificationSession;

		// 2回目
		const result2 = await emailVerificationInitiateUseCase.execute(userCredentials);
		assert(result2.isOk);
		const session2 = result2.value.emailVerificationSession;

		// 古いセッションは削除され、新しいセッションのみ存在
		expect(emailVerificationSessionMap.has(session1.id)).toBe(false);
		expect(emailVerificationSessionMap.has(session2.id)).toBe(true);
		expect(emailVerificationSessionMap.size).toBe(1);
	});

	it("Success: should generate 8-digit numeric verification code", async () => {
		const result = await emailVerificationInitiateUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationSession } = result.value;

		// 固定値と一致することを確認
		expect(emailVerificationSession.code).toBe(MOCK_VERIFICATION_CODE);

		// 8桁であること
		expect(emailVerificationSession.code).toHaveLength(8);

		// 数字のみであること
		expect(emailVerificationSession.code).toMatch(/^\d{8}$/);
	});

	it("Success: should include secret in session token", async () => {
		const result = await emailVerificationInitiateUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationSessionToken } = result.value;

		const decoded = decodeToken(emailVerificationSessionToken);
		expect(decoded).not.toBeNull();
		assert(decoded !== null);

		// シークレットが空でないこと
		expect(decoded.secret).toBeTruthy();
		expect(decoded.secret).toBe(MOCK_SECRET);
	});

	it("Success: should save secret hash to session", async () => {
		const result = await emailVerificationInitiateUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationSession } = result.value;

		// secretHashが存在すること
		expect(emailVerificationSession.secretHash).toBeDefined();
		expect(emailVerificationSession.secretHash).toBeInstanceOf(Uint8Array);
		expect(emailVerificationSession.secretHash.length).toBeGreaterThan(0);

		// 生のシークレットではなくハッシュが保存されていること
		const secretBytes = new TextEncoder().encode(MOCK_SECRET);
		expect(emailVerificationSession.secretHash).not.toEqual(secretBytes);
	});

	it("Success: should set expiration time on session", async () => {
		const beforeExecution = Date.now();
		const result = await emailVerificationInitiateUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationSession } = result.value;

		// 現在時刻より後に設定されていること
		expect(emailVerificationSession.expiresAt.getTime()).toBeGreaterThan(beforeExecution);
	});

	it("Error(email already verified): should return EMAIL_ALREADY_VERIFIED error when email is already verified", async () => {
		const { userCredentials: verifiedUserCredentials } = createAuthUserFixture({
			userRegistration: {
				email: "verified@example.com",
				name: "verified_user",
				emailVerified: true,
			},
		});

		const result = await emailVerificationInitiateUseCase.execute(verifiedUserCredentials);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_VERIFIED");

		// メールが送信されないこと
		expect(emailGateway.sendVerificationEmailCalls).toHaveLength(0);

		// セッションが作成されないこと
		expect(emailVerificationSessionMap.size).toBe(0);
	});
});
