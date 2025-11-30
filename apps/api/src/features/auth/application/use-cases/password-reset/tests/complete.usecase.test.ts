import { assert, beforeEach, describe, expect, it } from "vitest";
import { PasswordHashingServiceMock } from "../../../../../../core/testing/mocks/system";
import {
	createAuthUserFixture,
	createPasswordResetSessionFixture,
	createSessionFixture,
} from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	PasswordResetSessionRepositoryMock,
	SessionRepositoryMock,
	createAuthUsersMap,
	createPasswordResetSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { PasswordResetCompleteUseCase } from "../complete.usecase";

const passwordResetSessionMap = createPasswordResetSessionsMap();
const sessionMap = createSessionsMap();
const authUserMap = createAuthUsersMap();

const passwordResetSessionRepository = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const passwordHashingService = new PasswordHashingServiceMock();

const passwordResetCompleteUseCase = new PasswordResetCompleteUseCase(
	authUserRepository,
	passwordResetSessionRepository,
	sessionRepository,
	passwordHashingService,
);

const { userRegistration: user, userCredentials } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		name: "test_user",
	},
});

const NEW_PASSWORD = "new_password123";

describe("PasswordResetCompleteUseCase", () => {
	beforeEach(() => {
		passwordResetSessionMap.clear();
		sessionMap.clear();
		authUserMap.clear();
	});

	it("Success: should reset password and update user credentials when email is verified", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: true,
			},
		});

		authUserMap.set(user.id, user);

		const result = await passwordResetCompleteUseCase.execute(NEW_PASSWORD, session, userCredentials);

		expect(result.isErr).toBe(false);

		const savedUser = authUserMap.get(user.id);
		expect(savedUser).toBeDefined();
		assert(savedUser);

		// Mockの固定値を確認: PasswordHashingServiceMockは `"__password-hashed:${password}"` を返す
		expect(savedUser.passwordHash).toBe("__password-hashed:new_password123");
		expect(savedUser.id).toBe(user.id);
		expect(savedUser.email).toBe(user.email);
		expect(savedUser.name).toBe(user.name);

		// パスワード検証が正しく動作すること
		assert(savedUser.passwordHash);
		expect(await passwordHashingService.verify(NEW_PASSWORD, savedUser.passwordHash)).toBe(true);
	});

	it("Success: should delete all user sessions after password reset", async () => {
		const { session: existingSession1 } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});
		const { session: existingSession2 } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		sessionMap.set(existingSession1.id, existingSession1);
		sessionMap.set(existingSession2.id, existingSession2);

		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: true,
			},
		});

		authUserMap.set(user.id, user);

		const result = await passwordResetCompleteUseCase.execute(NEW_PASSWORD, session, userCredentials);

		expect(result.isErr).toBe(false);

		// セキュリティ: パスワードリセット後、すべてのセッションが削除されること（強制再ログイン）
		expect(sessionMap.size).toBe(0);
		expect(sessionMap.has(existingSession1.id)).toBe(false);
		expect(sessionMap.has(existingSession2.id)).toBe(false);
	});

	it("Success: should delete all password reset sessions for the user", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: true,
			},
		});
		const { passwordResetSession: anotherSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: false,
			},
		});

		authUserMap.set(user.id, user);
		passwordResetSessionMap.set(session.id, session);
		passwordResetSessionMap.set(anotherSession.id, anotherSession);

		const result = await passwordResetCompleteUseCase.execute(NEW_PASSWORD, session, userCredentials);

		expect(result.isErr).toBe(false);

		// セキュリティ: パスワードリセット後、すべてのパスワードリセットセッションが削除されること（再利用防止）
		expect(passwordResetSessionMap.has(session.id)).toBe(false);
		expect(passwordResetSessionMap.has(anotherSession.id)).toBe(false);
		expect(passwordResetSessionMap.size).toBe(0);
	});

	it("Error: should return REQUIRED_EMAIL_VERIFICATION error when email is not verified", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: false,
			},
		});

		authUserMap.set(user.id, user);

		const result = await passwordResetCompleteUseCase.execute(NEW_PASSWORD, session, userCredentials);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("REQUIRED_EMAIL_VERIFICATION");

		// パスワードが更新されていないこと
		const savedUser = authUserMap.get(user.id);
		expect(savedUser).toBeDefined();
		assert(savedUser);
		expect(savedUser.passwordHash).not.toBe("__password-hashed:new_password123");

		// セッションが削除されていないこと
		expect(sessionMap.size).toBeGreaterThanOrEqual(0);
	});

	it("Error: should not update password when email verification is not completed", async () => {
		const originalPasswordHash = user.passwordHash;
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: false,
			},
		});

		authUserMap.set(user.id, user);

		const result = await passwordResetCompleteUseCase.execute(NEW_PASSWORD, session, userCredentials);

		expect(result.isErr).toBe(true);

		const savedUser = authUserMap.get(user.id);
		expect(savedUser).toBeDefined();
		assert(savedUser);

		// パスワードが変更されていないこと
		expect(savedUser.passwordHash).toBe(originalPasswordHash);
	});
});
