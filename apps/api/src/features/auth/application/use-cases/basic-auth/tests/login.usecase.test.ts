import { beforeEach, describe, expect, it } from "vitest";
import { createUserFixture } from "../../../../../../tests/fixtures";
import {
	PasswordHasherMock,
	SessionRepositoryMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
} from "../../../../../../tests/mocks";
import { createSessionsMap, createUserPasswordHashMap, createUsersMap } from "../../../../../../tests/mocks";
import { LoginUseCase } from "../login.usecase";

const sessionMap = createSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const sessionRepositoryMock = new SessionRepositoryMock({
	sessionMap,
});

const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();
const passwordHasher = new PasswordHasherMock();

const loginUseCase = new LoginUseCase(sessionRepositoryMock, userRepository, sessionSecretHasher, passwordHasher);

const password = "password123";
const passwordHash = await passwordHasher.hash(password);

const { user } = createUserFixture({
	user: {
		email: "test@example.com",
	},
});

describe("LoginUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();

		userMap.set(user.id, user);
		if (passwordHash) {
			userPasswordHashMap.set(user.id, passwordHash);
		}
	});

	it("should be able to login with valid credentials", async () => {
		const result = await loginUseCase.execute(user.email, "password123");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;
			expect(session.userId).toBe(user.id);
			expect(typeof sessionToken).toBe("string");
			expect(sessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should return INVALID_CREDENTIALS error when user does not exist", async () => {
		userMap.clear();
		userPasswordHashMap.clear();
		sessionMap.clear();

		const result = await loginUseCase.execute("nonexistent@example.com", "password123");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should return INVALID_CREDENTIALS error when password is incorrect", async () => {
		const result = await loginUseCase.execute(user.email, "wrong_password");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should return INVALID_CREDENTIALS error when email is incorrect", async () => {
		const result = await loginUseCase.execute("incorrect@example.com", "password123");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should return INVALID_CREDENTIALS error when user has no password hash", async () => {
		userPasswordHashMap.clear();

		const result = await loginUseCase.execute(user.email, "password123");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should create and save a new session on successful login", async () => {
		const result = await loginUseCase.execute(user.email, "password123");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session } = result.value;
			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
		}
	});
});
