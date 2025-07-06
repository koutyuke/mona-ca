import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createSession, createUser } from "../../../../domain/entities";
import { newGender, newSessionId, newUserId } from "../../../../domain/value-object";
import { PasswordServiceMock, SessionSecretServiceMock } from "../../../../tests/mocks";
import { SessionRepositoryMock } from "../../../../tests/mocks/repositories/session.repository.mock";
import { createSessionsMap, createUsersMap } from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { UpdateUserPasswordUseCase } from "../update-user-password.usecase";

describe("UpdateUserPasswordUseCase", () => {
	let updateUserPasswordUseCase: UpdateUserPasswordUseCase;
	let userRepositoryMock: UserRepositoryMock;
	let sessionRepositoryMock: SessionRepositoryMock;
	let passwordServiceMock: PasswordServiceMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const userPasswordHashMap = new Map();
		const sessionMap = createSessionsMap();

		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		sessionRepositoryMock = new SessionRepositoryMock({
			sessionMap,
		});
		passwordServiceMock = new PasswordServiceMock();
		sessionSecretServiceMock = new SessionSecretServiceMock();

		updateUserPasswordUseCase = new UpdateUserPasswordUseCase(
			userRepositoryMock,
			sessionRepositoryMock,
			passwordServiceMock,
			sessionSecretServiceMock,
		);
	});

	it("should update password successfully when no existing password and no current password provided", async () => {
		// create user without password
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// no password hash exists for this user
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, undefined, newPassword);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(userId);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}

		// verify password was saved
		const savedPasswordHash = userRepositoryMock.userPasswordHashMap.get(userId);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe(newPassword); // should be hashed
	});

	it("should return INVALID_CURRENT_PASSWORD error when no existing password but current password provided", async () => {
		// create user without password
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// no password hash exists for this user
		const currentPassword = "wrong_password";
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, currentPassword, newPassword);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should return INVALID_CURRENT_PASSWORD error when existing password but no current password provided", async () => {
		// create user with existing password
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// set existing password hash
		const existingPasswordHash = "existing_hash";
		userRepositoryMock.userPasswordHashMap.set(userId, existingPasswordHash);

		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, undefined, newPassword);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should return INVALID_CURRENT_PASSWORD error when current password is incorrect", async () => {
		// create user with existing password
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// set existing password hash
		const existingPassword = "existing_password";
		const existingPasswordHash = await passwordServiceMock.hashPassword(existingPassword);
		userRepositoryMock.userPasswordHashMap.set(userId, existingPasswordHash);

		const wrongCurrentPassword = "wrong_password";
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, wrongCurrentPassword, newPassword);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should update password successfully when current password is correct", async () => {
		// create user with existing password
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// set existing password hash
		const existingPassword = "existing_password";
		const existingPasswordHash = await passwordServiceMock.hashPassword(existingPassword);
		userRepositoryMock.userPasswordHashMap.set(userId, existingPasswordHash);

		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, existingPassword, newPassword);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(userId);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}

		// verify password was updated
		const savedPasswordHash = userRepositoryMock.userPasswordHashMap.get(userId);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe(newPassword); // should be hashed
		expect(savedPasswordHash).not.toBe(existingPasswordHash); // should be different from old hash
	});

	it("should delete all user sessions when password is updated", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		const sessionId1 = newSessionId(ulid());
		const sessionSecret1 = sessionSecretServiceMock.generateSessionSecret();
		const session1 = createSession({
			id: sessionId1,
			userId: userId,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret1),
		});

		const sessionId2 = newSessionId(ulid());
		const sessionSecret2 = sessionSecretServiceMock.generateSessionSecret();
		const session2 = createSession({
			id: sessionId2,
			userId: userId,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret2),
		});

		sessionRepositoryMock.sessionMap.set(sessionId1, session1);
		sessionRepositoryMock.sessionMap.set(sessionId2, session2);

		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, undefined, newPassword);

		expect(isErr(result)).toBe(false);

		expect(sessionRepositoryMock.sessionMap.has(sessionId1)).toBe(false);
		expect(sessionRepositoryMock.sessionMap.has(sessionId2)).toBe(false);
	});

	it("should create and save new session after password update", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// no password hash exists for this user
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, undefined, newPassword);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			// verify session was created
			const savedSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
			expect(savedSession?.id).toBe(result.session.id);
		}
	});

	it("should generate session token with correct format", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// no password hash exists for this user
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, undefined, newPassword);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
			expect(result.sessionToken.split(".").length).toBe(2);
		}
	});

	it("should save user with new password hash", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// no password hash exists for this user
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, undefined, newPassword);

		expect(isErr(result)).toBe(false);

		// verify user was saved
		const savedUser = userRepositoryMock.userMap.get(userId);
		expect(savedUser).toBeDefined();
		expect(savedUser?.id).toBe(userId);
		expect(savedUser?.email).toBe(user.email);

		// verify password hash was saved
		const savedPasswordHash = userRepositoryMock.userPasswordHashMap.get(userId);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe(newPassword); // should be hashed
		expect(savedPasswordHash).toBe(await passwordServiceMock.hashPassword(newPassword)); // should match mock hash
	});

	it("should hash new password before saving", async () => {
		// create user
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "test_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		// no password hash exists for this user
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, undefined, newPassword);

		expect(isErr(result)).toBe(false);

		// verify password was hashed
		const savedPasswordHash = userRepositoryMock.userPasswordHashMap.get(userId);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe(newPassword); // should be hashed
		expect(savedPasswordHash).toBe(await passwordServiceMock.hashPassword(newPassword)); // should match mock hash
	});
});
