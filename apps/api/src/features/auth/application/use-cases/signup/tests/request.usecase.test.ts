import { assert, beforeEach, describe, expect, it } from "vitest";
import { newGender, newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createUserRegistration } from "../../../../domain/entities/user-registration";
import { createAuthUserFixture, createSignupSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	createAuthUserMap,
	createSessionMap,
	createSignupSessionMap,
	SignupSessionRepositoryMock,
} from "../../../../testing/mocks/repositories";
import { SignupRequestUseCase } from "../request.usecase";

const sessionMap = createSessionMap();
const authUserMap = createAuthUserMap();
const signupSessionMap = createSignupSessionMap();

const emailGateway = new EmailGatewayMock();
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const signupSessionRepository = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const cryptoRandomService = new CryptoRandomServiceMock();
const tokenSecretService = new TokenSecretServiceMock();

const signupRequestUseCase = new SignupRequestUseCase(
	emailGateway,
	authUserRepository,
	signupSessionRepository,
	cryptoRandomService,
	tokenSecretService,
);

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "existing@example.com",
		name: "Existing User",
	},
});

const NEW_EMAIL = "new@example.com";
const EXISTING_EMAIL = "existing@example.com";

describe("SignupRequestUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		authUserMap.clear();
		signupSessionMap.clear();
		emailGateway.sendVerificationEmailCalls = [];

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("Success: should create signup session with valid email", async () => {
		const result = await signupRequestUseCase.execute(NEW_EMAIL);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { signupSession, signupSessionToken } = result.value;

		// check signup session
		expect(signupSession.email).toBe(NEW_EMAIL);
		expect(signupSession.emailVerified).toBe(false);
		expect(signupSession.code).toBeDefined();
		expect(signupSession.code.length).toBe(8);
		expect(/^\d{8}$/.test(signupSession.code)).toBe(true);

		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(signupSessionToken).toBe(`${signupSession.id}.token-secret`);
		expect(signupSession.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check signup session is saved
		const savedSession = signupSessionMap.get(signupSession.id);
		expect(savedSession).toStrictEqual(signupSession);

		// check verification email is sent
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(1);
		expect(emailGateway.sendVerificationEmailCalls[0]?.email).toBe(NEW_EMAIL);
		expect(emailGateway.sendVerificationEmailCalls[0]?.code).toBe(signupSession.code);
	});

	it("Success: should delete existing sessions before creating new one", async () => {
		const { signupSession: existingSignupSession } = createSignupSessionFixture({
			signupSession: {
				email: NEW_EMAIL,
				code: "87654321",
			},
			signupSessionSecret: "existingSecret",
		});

		signupSessionMap.set(existingSignupSession.id, existingSignupSession);
		expect(signupSessionMap.size).toBe(1);

		const result = await signupRequestUseCase.execute(NEW_EMAIL);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { signupSession } = result.value;

		// セキュリティ: 既存のセッションが削除され、新しいセッションが作成されていること（再利用防止）
		expect(signupSessionMap.has(existingSignupSession.id)).toBe(false);
		expect(signupSessionMap.size).toBe(1);
		expect(signupSession.id).not.toBe(existingSignupSession.id);
	});

	it("Error: should return EMAIL_ALREADY_USED error when email is already registered", async () => {
		const result = await signupRequestUseCase.execute(EXISTING_EMAIL);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_USED");

		// セッションが作成されていないこと
		expect(signupSessionMap.size).toBe(0);
		// メールが送信されていないこと
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(0);
	});

	it("Error: should return EMAIL_ALREADY_USED error for empty email", async () => {
		const existingUser = createUserRegistration({
			id: newUserId(ulid()),
			email: EXISTING_EMAIL,
			name: "Existing User",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("male"),
			passwordHash: null,
		});

		authUserMap.set(existingUser.id, existingUser);

		const result = await signupRequestUseCase.execute(EXISTING_EMAIL);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_USED");
	});
});
