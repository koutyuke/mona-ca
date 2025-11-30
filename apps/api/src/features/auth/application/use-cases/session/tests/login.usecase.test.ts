import { assert, beforeEach, describe, expect, it } from "vitest";
import { PasswordHashingServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createAuthUserFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SessionRepositoryMock,
	createAuthUsersMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { LoginUseCase } from "../login.usecase";

const sessionMap = createSessionsMap();
const authUserMap = createAuthUsersMap();
const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const tokenSecretService = new TokenSecretServiceMock();
const passwordHashingService = new PasswordHashingServiceMock();

const loginUseCase = new LoginUseCase(
	authUserRepository,
	sessionRepository,
	passwordHashingService,
	tokenSecretService,
);

const PASSWORD = "password123";
const passwordHash = await passwordHashingService.hash(PASSWORD);

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		passwordHash,
	},
});

describe("LoginUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		authUserMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("Success: should login with valid credentials and create session", async () => {
		const result = await loginUseCase.execute(userRegistration.email, PASSWORD);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken } = result.value;

		// check session
		expect(session.userId).toBe(userRegistration.id);
		expect(session.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check session token
		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(sessionToken).toBe(`${session.id}.token-secret`);

		// check session is saved
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toBeDefined();
		assert(savedSession);
		expect(savedSession).toStrictEqual(session);
	});

	it("Error: should return INVALID_CREDENTIALS error when user does not exist", async () => {
		authUserMap.clear();

		const result = await loginUseCase.execute("nonexistent@example.com", PASSWORD);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CREDENTIALS");

		// セッションが作成されていないこと
		expect(sessionMap.size).toBe(0);
	});

	it("Error: should return INVALID_CREDENTIALS error when password is incorrect", async () => {
		const result = await loginUseCase.execute(userRegistration.email, "wrong_password");

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CREDENTIALS");

		// セッションが作成されていないこと
		expect(sessionMap.size).toBe(0);
	});

	it("Error: should return INVALID_CREDENTIALS error when email is incorrect", async () => {
		const result = await loginUseCase.execute("incorrect@example.com", PASSWORD);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CREDENTIALS");

		// セッションが作成されていないこと
		expect(sessionMap.size).toBe(0);
	});

	it("Error: should return INVALID_CREDENTIALS error when user has no password hash", async () => {
		const userWithoutPassword = {
			...userRegistration,
			passwordHash: null,
		};
		authUserMap.set(userWithoutPassword.id, userWithoutPassword);

		const result = await loginUseCase.execute(userRegistration.email, PASSWORD);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CREDENTIALS");

		// セッションが作成されていないこと
		expect(sessionMap.size).toBe(0);
	});

	it("Error: should return INVALID_CREDENTIALS error when email is empty", async () => {
		const result = await loginUseCase.execute("", PASSWORD);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CREDENTIALS");
	});

	it("Error: should return INVALID_CREDENTIALS error when password is empty", async () => {
		const result = await loginUseCase.execute(userRegistration.email, "");

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CREDENTIALS");
	});
});
