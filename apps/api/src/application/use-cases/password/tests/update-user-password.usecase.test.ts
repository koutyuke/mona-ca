import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { createSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	PasswordServiceMock,
	SessionRepositoryMock,
	UserRepositoryMock,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { UpdateUserPasswordUseCase } from "../update-user-password.usecase";

const sessionMap = createSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const sessionRepositoryMock = new SessionRepositoryMock({
	sessionMap,
});
const userRepositoryMock = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const passwordServiceMock = new PasswordServiceMock();
const updateUserPasswordUseCase = new UpdateUserPasswordUseCase(
	userRepositoryMock,
	sessionRepositoryMock,
	passwordServiceMock,
);

const { user } = createUserFixture({
	user: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("UpdateUserPasswordUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();
	});

	it("should update password successfully when no existing password and no current password provided", async () => {
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, undefined, newPassword);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(user.id);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}

		const savedPasswordHash = userPasswordHashMap.get(user.id);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe(newPassword);
		if (savedPasswordHash) {
			expect(await passwordServiceMock.verifyPassword(newPassword, savedPasswordHash)).toBe(true);
		}
	});

	it("should return INVALID_CURRENT_PASSWORD error when no existing password but current password provided", async () => {
		const result = await updateUserPasswordUseCase.execute(user, "wrong_password", "new_password123");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should return INVALID_CURRENT_PASSWORD error when existing password but no current password provided", async () => {
		userPasswordHashMap.set(user.id, "existing_hash");

		const result = await updateUserPasswordUseCase.execute(user, undefined, "new_password123");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should return INVALID_CURRENT_PASSWORD error when current password is incorrect", async () => {
		const existingPassword = "existing_password";
		const existingPasswordHash = await passwordServiceMock.hashPassword(existingPassword);
		userPasswordHashMap.set(user.id, existingPasswordHash);

		const result = await updateUserPasswordUseCase.execute(user, "wrong_password", "new_password123");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should update password successfully when current password is correct", async () => {
		const existingPassword = "existing_password";
		const existingPasswordHash = await passwordServiceMock.hashPassword(existingPassword);
		userPasswordHashMap.set(user.id, existingPasswordHash);

		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(user, existingPassword, newPassword);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(user.id);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}

		const savedPasswordHash = userPasswordHashMap.get(user.id);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe(newPassword);
		expect(savedPasswordHash).not.toBe(existingPasswordHash);
		if (savedPasswordHash) {
			expect(await passwordServiceMock.verifyPassword(newPassword, savedPasswordHash)).toBe(true);
		}
	});

	it("should delete all user sessions when password is updated", async () => {
		const { session: session1 } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});
		const { session: session2 } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		sessionMap.set(session1.id, session1);
		sessionMap.set(session2.id, session2);

		const result = await updateUserPasswordUseCase.execute(user, undefined, "new_password123");

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(sessionMap.has(session1.id)).toBe(false);
			expect(sessionMap.has(session2.id)).toBe(false);
			expect(sessionMap.size).toBe(1);
			expect(sessionMap.get(result.session.id)).toBeDefined();
		}
	});

	it("should create and save new session after password update", async () => {
		const result = await updateUserPasswordUseCase.execute(user, undefined, "new_password123");

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
			expect(savedSession?.id).toBe(result.session.id);
		}
	});

	it("should generate session token with correct format", async () => {
		const result = await updateUserPasswordUseCase.execute(user, undefined, "new_password123");

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
			expect(result.sessionToken.split(".").length).toBe(2);
		}
	});

	it("should save user with new password hash", async () => {
		const result = await updateUserPasswordUseCase.execute(user, undefined, "new_password123");

		expect(isErr(result)).toBe(false);

		const savedUser = userMap.get(user.id);
		expect(savedUser).toBeDefined();
		expect(savedUser?.id).toBe(user.id);
		expect(savedUser?.email).toBe(user.email);

		const savedPasswordHash = userPasswordHashMap.get(user.id);
		expect(savedPasswordHash).toBeDefined();
		expect(savedPasswordHash).not.toBe("new_password123");
		if (savedPasswordHash) {
			expect(await passwordServiceMock.verifyPassword("new_password123", savedPasswordHash)).toBe(true);
		}
	});
});
