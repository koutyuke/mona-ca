import { beforeEach, describe, expect, it } from "vitest";
import { createPasswordResetSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	PasswordResetSessionRepositoryMock,
	RandomGeneratorMock,
	SessionSecretHasherMock,
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

const passwordResetSessionRepository = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const randomGenerator = new RandomGeneratorMock();
const sessionSecretHasher = new SessionSecretHasherMock();

const passwordResetRequestUseCase = new PasswordResetRequestUseCase(
	passwordResetSessionRepository,
	userRepository,
	randomGenerator,
	sessionSecretHasher,
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

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession, passwordResetSessionToken } = result.value;
			expect(passwordResetSession.userId).toBe(user.id);
			expect(passwordResetSession.email).toBe(user.email);
			expect(passwordResetSession.code).toBeDefined();
			expect(passwordResetSession.code.length).toBe(8);
			expect(/^\d{8}$/.test(passwordResetSession.code)).toBe(true);
			expect(typeof passwordResetSessionToken).toBe("string");
			expect(passwordResetSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should return USER_NOT_FOUND error for non-existent user", async () => {
		userMap.clear();
		const result = await passwordResetRequestUseCase.execute("nonexistent@example.com");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("USER_NOT_FOUND");
		}
	});

	it("should generate 8-digit numeric verification code", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession } = result.value;
			const code = passwordResetSession.code;
			expect(code).toBeDefined();
			expect(code.length).toBe(8);
			expect(/^\d{8}$/.test(code)).toBe(true);
		}
	});

	it("should create session token with correct format", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSessionToken } = result.value;
			expect(typeof passwordResetSessionToken).toBe("string");
			expect(passwordResetSessionToken.length).toBeGreaterThan(0);
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

		expect(result.isErr).toBe(false);

		expect(passwordResetSessionMap.has(existingSession1.id)).toBe(false);
		expect(passwordResetSessionMap.has(existingSession2.id)).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession } = result.value;
			const newSession = passwordResetSessionMap.get(passwordResetSession.id);
			expect(newSession).toBeDefined();
			expect(newSession?.userId).toBe(user.id);
		}
	});

	it("should save new password reset session", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession } = result.value;
			const savedSession = passwordResetSessionMap.get(passwordResetSession.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
			expect(savedSession?.email).toBe(user.email);
			expect(savedSession?.code).toBeDefined();
			expect(savedSession?.code.length).toBe(8);
			expect(savedSession?.email).toBe(user.email);
		}
	});

	it("should generate session secret and hash it", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession } = result.value;
			expect(passwordResetSession.secretHash).toBeDefined();
			expect(passwordResetSession.secretHash).toBeInstanceOf(Uint8Array);
			expect(passwordResetSession.secretHash.length).toBeGreaterThan(0);
		}
	});

	it("should set session email to user email", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession } = result.value;
			expect(passwordResetSession.email).toBe(user.email);
		}
	});

	it("should create password reset session with correct user id", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSession } = result.value;
			expect(passwordResetSession.userId).toBe(user.id);
		}
	});

	it("should handle case insensitive email lookup", async () => {
		const uppercaseEmail = "TEST@EXAMPLE.COM";
		const result = await passwordResetRequestUseCase.execute(uppercaseEmail);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("USER_NOT_FOUND");
		}
	});

	it("should return new session token that can be used for validation", async () => {
		const result = await passwordResetRequestUseCase.execute(user.email);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { passwordResetSessionToken } = result.value;
			expect(passwordResetSessionToken).toBeDefined();
			expect(typeof passwordResetSessionToken).toBe("string");
			expect(passwordResetSessionToken.length).toBeGreaterThan(0);
			expect(passwordResetSessionToken.split(".")).toHaveLength(2);
		}
	});
});
