import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { createPasswordResetSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	PasswordResetSessionRepositoryMock,
	UserRepositoryMock,
	createPasswordResetSessionsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { PasswordResetRequestUseCase } from "../password-reset-request.usecase";

const passwordResetSessionMap = createPasswordResetSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const sessionMap = createSessionsMap();
const passwordResetSessionRepositoryMock = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const userRepositoryMock = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const passwordResetRequestUseCase = new PasswordResetRequestUseCase(
	passwordResetSessionRepositoryMock,
	userRepositoryMock,
);

const { user } = createUserFixture({
	user: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("PasswordResetRequestUseCase", () => {
	beforeEach(() => {
		passwordResetSessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();
		sessionMap.clear();

		userMap.set(user.id, user);
	});

	it("should create password reset session successfully for existing user", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("passwordResetSession");
		expect(result).toHaveProperty("passwordResetSessionToken");

		if (!isErr(result)) {
			expect(result.passwordResetSession.userId).toBe(user.id);
			expect(result.passwordResetSession.email).toBe(user.email);
			expect(result.passwordResetSession.code).toBeDefined();
			expect(result.passwordResetSession.code.length).toBe(8);
			expect(/^\d{8}$/.test(result.passwordResetSession.code)).toBe(true);
			expect(typeof result.passwordResetSessionToken).toBe("string");
			expect(result.passwordResetSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should return USER_NOT_FOUND error for non-existent user", async () => {
		userMap.clear();
		const result = await passwordResetRequestUseCase.execute("nonexistent@example.com");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("USER_NOT_FOUND");
		}
	});

	it("should generate 8-digit numeric verification code", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const code = result.passwordResetSession.code;
			expect(code).toBeDefined();
			expect(code.length).toBe(8);
			expect(/^\d{8}$/.test(code)).toBe(true);
		}
	});

	it("should create session token with correct format", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.passwordResetSessionToken).toBe("string");
			expect(result.passwordResetSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should delete existing password reset sessions before creating new one", async () => {
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

		expect(isErr(result)).toBe(false);

		expect(passwordResetSessionMap.has(existingSession1.id)).toBe(false);
		expect(passwordResetSessionMap.has(existingSession2.id)).toBe(false);

		if (!isErr(result)) {
			const newSession = passwordResetSessionMap.get(result.passwordResetSession.id);
			expect(newSession).toBeDefined();
			expect(newSession?.userId).toBe(user.id);
		}
	});

	it("should save new password reset session", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = passwordResetSessionMap.get(result.passwordResetSession.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
			expect(savedSession?.email).toBe(user.email);
			expect(savedSession?.code).toBeDefined();
			expect(savedSession?.code.length).toBe(8);
		}
	});

	it("should generate session secret and hash it", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSession.secretHash).toBeDefined();
			expect(result.passwordResetSession.secretHash).toBeInstanceOf(Uint8Array);
			expect(result.passwordResetSession.secretHash.length).toBeGreaterThan(0);
		}
	});

	it("should set session email to user email", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSession.email).toBe(user.email);
		}
	});

	it("should create password reset session with correct user id", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSession.userId).toBe(user.id);
		}
	});

	it("should handle case insensitive email lookup", async () => {
		const uppercaseEmail = "TEST@EXAMPLE.COM";
		const result = await passwordResetRequestUseCase.execute(uppercaseEmail);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("USER_NOT_FOUND");
		}
	});

	it("should return new session token that can be used for validation", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.passwordResetSessionToken).toBeDefined();
			expect(typeof result.passwordResetSessionToken).toBe("string");
			expect(result.passwordResetSessionToken.length).toBeGreaterThan(0);
			expect(result.passwordResetSessionToken.split(".")).toHaveLength(2);
		}
	});
});
