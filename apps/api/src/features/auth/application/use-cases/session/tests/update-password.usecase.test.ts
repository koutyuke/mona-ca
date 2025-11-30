import { assert, beforeEach, describe, expect, it } from "vitest";
import { PasswordHashingServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SessionRepositoryMock,
	createAuthUsersMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { UpdatePasswordUseCase } from "../update-password.usecase";

const sessionMap = createSessionsMap();
const authUserMap = createAuthUsersMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const passwordHashingService = new PasswordHashingServiceMock();
const tokenSecretService = new TokenSecretServiceMock();

const updatePasswordUseCase = new UpdatePasswordUseCase(
	authUserRepository,
	sessionRepository,
	passwordHashingService,
	tokenSecretService,
);

const { userRegistration, userCredentials } = createAuthUserFixture({
	userRegistration: {
		passwordHash: null,
	},
});

const NEW_PASSWORD = "new_password123";
const EXISTING_PASSWORD = "existing_password";

describe("UpdatePasswordUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		authUserMap.clear();
	});

	it("Success: should update password when no existing password and no current password provided", async () => {
		authUserMap.set(userRegistration.id, userRegistration);

		const result = await updatePasswordUseCase.execute(userCredentials, null, NEW_PASSWORD);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken } = result.value;

		// check session
		expect(session.userId).toBe(userRegistration.id);
		expect(session.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check session token
		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(sessionToken).toBe(`${session.id}.token-secret`);

		// check password is updated
		const savedUser = authUserMap.get(userRegistration.id);
		expect(savedUser).toBeDefined();
		assert(savedUser);
		// Mockの固定値を確認: PasswordHashingServiceMockは `"__password-hashed:${password}"` を返す
		expect(savedUser.passwordHash).toBe("__password-hashed:new_password123");
		assert(savedUser.passwordHash);
		expect(await passwordHashingService.verify(NEW_PASSWORD, savedUser.passwordHash)).toBe(true);
	});

	it("Success: should update password when current password is correct", async () => {
		const existingPasswordHash = await passwordHashingService.hash(EXISTING_PASSWORD);
		const userWithPassword = { ...userRegistration, passwordHash: existingPasswordHash };
		const userCredentialsWithPassword = { ...userCredentials, passwordHash: existingPasswordHash };
		authUserMap.set(userWithPassword.id, userWithPassword);

		const result = await updatePasswordUseCase.execute(userCredentialsWithPassword, EXISTING_PASSWORD, NEW_PASSWORD);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken } = result.value;

		expect(session.userId).toBe(userWithPassword.id);
		expect(sessionToken).toBe(`${session.id}.token-secret`);

		const savedUser = authUserMap.get(userWithPassword.id);
		expect(savedUser?.passwordHash).toBeDefined();
		expect(savedUser?.passwordHash).toBe("__password-hashed:new_password123");
		expect(savedUser?.passwordHash).not.toBe(existingPasswordHash);
		assert(savedUser?.passwordHash);
		expect(await passwordHashingService.verify(NEW_PASSWORD, savedUser.passwordHash)).toBe(true);
	});

	it("Success: should delete all user sessions and create new session when password is updated", async () => {
		authUserMap.set(userRegistration.id, userRegistration);
		const { session: session1 } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		const { session: session2 } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		sessionMap.set(session1.id, session1);
		sessionMap.set(session2.id, session2);

		const result = await updatePasswordUseCase.execute(userCredentials, null, NEW_PASSWORD);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session } = result.value;

		// セキュリティ: パスワード更新後、すべてのセッションが削除され、新しいセッションが作成されること（強制再ログイン）
		expect(sessionMap.has(session1.id)).toBe(false);
		expect(sessionMap.has(session2.id)).toBe(false);
		expect(sessionMap.size).toBe(1);
		expect(sessionMap.get(session.id)).toBeDefined();
	});

	it("Error: should return INVALID_CURRENT_PASSWORD error when no existing password but current password provided", async () => {
		authUserMap.set(userRegistration.id, userRegistration);

		const result = await updatePasswordUseCase.execute(userCredentials, "wrong_password", NEW_PASSWORD);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CURRENT_PASSWORD");

		// パスワードが更新されていないこと
		const savedUser = authUserMap.get(userRegistration.id);
		expect(savedUser?.passwordHash).toBeNull();
	});

	it("Error: should return INVALID_CURRENT_PASSWORD error when existing password but no current password provided", async () => {
		const userWithPassword = { ...userRegistration, passwordHash: "existing_hash" };
		const userCredentialsWithPassword = { ...userCredentials, passwordHash: "existing_hash" };
		authUserMap.set(userWithPassword.id, userWithPassword);

		const result = await updatePasswordUseCase.execute(userCredentialsWithPassword, null, NEW_PASSWORD);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CURRENT_PASSWORD");

		// パスワードが更新されていないこと
		const savedUser = authUserMap.get(userWithPassword.id);
		expect(savedUser?.passwordHash).toBe("existing_hash");
	});

	it("Error: should return INVALID_CURRENT_PASSWORD error when current password is incorrect", async () => {
		const existingPasswordHash = await passwordHashingService.hash(EXISTING_PASSWORD);
		const userWithPassword = { ...userRegistration, passwordHash: existingPasswordHash };
		const userCredentialsWithPassword = { ...userCredentials, passwordHash: existingPasswordHash };
		authUserMap.set(userWithPassword.id, userWithPassword);

		const result = await updatePasswordUseCase.execute(userCredentialsWithPassword, "wrong_password", NEW_PASSWORD);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CURRENT_PASSWORD");

		// パスワードが更新されていないこと
		const savedUser = authUserMap.get(userWithPassword.id);
		expect(savedUser?.passwordHash).toBe(existingPasswordHash);
	});
});
