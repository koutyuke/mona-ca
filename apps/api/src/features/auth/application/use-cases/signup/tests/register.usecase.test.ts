import { assert, afterEach, describe, expect, it } from "vitest";
import { newGender, newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { PasswordHashingServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createUserRegistration } from "../../../../domain/entities/user-registration";
import { createSignupSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SessionRepositoryMock,
	SignupSessionRepositoryMock,
	createAuthUserMap,
	createSessionMap,
	createSignupSessionMap,
} from "../../../../testing/mocks/repositories";
import { SignupRegisterUseCase } from "../register.usecase";

const sessionMap = createSessionMap();
const authUserMap = createAuthUserMap();
const signupSessionMap = createSignupSessionMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const signupSessionRepository = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const tokenSecretService = new TokenSecretServiceMock();
const passwordHashingService = new PasswordHashingServiceMock();

const signupRegisterUseCase = new SignupRegisterUseCase(
	authUserRepository,
	sessionRepository,
	signupSessionRepository,
	tokenSecretService,
	passwordHashingService,
);

const USER_NAME = "Test User";
const USER_EMAIL = "test@example.com";
const PASSWORD = "password123";
const GENDER = newGender("female" as const);

describe("SignupRegisterUseCase", () => {
	afterEach(() => {
		sessionMap.clear();
		authUserMap.clear();
		signupSessionMap.clear();
	});

	it("Success: should create user and session when signup session is verified", async () => {
		const { signupSession } = createSignupSessionFixture({
			signupSession: {
				email: USER_EMAIL,
				emailVerified: true,
				code: "12345678",
			},
		});

		signupSessionMap.set(signupSession.id, signupSession);

		const result = await signupRegisterUseCase.execute(signupSession, USER_NAME, PASSWORD, GENDER);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken } = result.value;

		// check session
		expect(session.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check session token
		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(sessionToken).toBe(`${session.id}.token-secret`);

		// check user is created
		const savedUser = Array.from(authUserMap.values()).find(u => u.email === USER_EMAIL);
		expect(savedUser).toBeDefined();
		assert(savedUser);

		expect(savedUser.name).toBe(USER_NAME);
		expect(savedUser.email).toBe(USER_EMAIL);
		expect(savedUser.emailVerified).toBe(true);
		expect(savedUser.gender).toBe(GENDER);
		expect(savedUser.passwordHash).toBe("__password-hashed:password123");
		expect(session.userId).toBe(savedUser.id);

		// check session is saved
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toStrictEqual(session);

		// check signup session is deleted
		expect(signupSessionMap.has(signupSession.id)).toBe(false);
	});

	it("Success: should hash password and save user with correct values", async () => {
		const { signupSession } = createSignupSessionFixture({
			signupSession: {
				email: USER_EMAIL,
				emailVerified: true,
				code: "12345678",
			},
		});

		signupSessionMap.set(signupSession.id, signupSession);

		const result = await signupRegisterUseCase.execute(
			signupSession,
			"Hashed User",
			"securePassword",
			newGender("male" as const),
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken } = result.value;

		const savedUser = Array.from(authUserMap.values()).find(u => u.email === USER_EMAIL);
		expect(savedUser).toBeDefined();
		assert(savedUser);

		// Mockの固定値を確認: PasswordHashingServiceMockは `"__password-hashed:${password}"` を返す
		expect(savedUser.passwordHash).toBe("__password-hashed:securePassword");
		expect(savedUser.email).toBe(USER_EMAIL);
		expect(savedUser.emailVerified).toBe(true);

		const savedSession = sessionMap.get(session.id);
		expect(savedSession?.userId).toBe(savedUser.id);
		expect(sessionToken).toBe(`${session.id}.token-secret`);
	});

	it("Error: should return EMAIL_VERIFICATION_REQUIRED error when email is not verified", async () => {
		const { signupSession } = createSignupSessionFixture({
			signupSession: {
				email: USER_EMAIL,
				code: "12345678",
				emailVerified: false,
			},
		});

		const result = await signupRegisterUseCase.execute(signupSession, USER_NAME, PASSWORD, GENDER);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_REQUIRED");

		// ユーザーが作成されていないこと
		const savedUser = Array.from(authUserMap.values()).find(u => u.email === USER_EMAIL);
		expect(savedUser).toBeUndefined();
		// セッションが作成されていないこと
		expect(sessionMap.size).toBe(0);
	});

	it("Error: should return EMAIL_ALREADY_REGISTERED error when email already exists", async () => {
		const { signupSession } = createSignupSessionFixture({
			signupSession: {
				email: USER_EMAIL,
				emailVerified: true,
				code: "12345678",
			},
		});

		signupSessionMap.set(signupSession.id, signupSession);

		const existingUser = createUserRegistration({
			id: newUserId(ulid()),
			email: signupSession.email,
			name: "Existing User",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("male" as const),
			passwordHash: "hashedPassword",
		});

		authUserMap.set(existingUser.id, existingUser);

		const result = await signupRegisterUseCase.execute(signupSession, "Another User", PASSWORD, newGender("male"));

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");

		// セキュリティ: 既存のメールアドレスの場合、サインアップセッションは削除されること
		expect(signupSessionMap.has(signupSession.id)).toBe(false);
		// 新しいユーザーが作成されていないこと
		expect(authUserMap.size).toBe(1);
		expect(Array.from(authUserMap.values())[0]?.id).toBe(existingUser.id);
	});
});
