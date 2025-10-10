import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { createUserFixture } from "../../../../tests/fixtures";
import { PasswordServiceMock, SessionRepositoryMock, UserRepositoryMock } from "../../../../tests/mocks";
import { createSessionsMap, createUserPasswordHashMap, createUsersMap } from "../../../../tests/mocks";
import { LoginUseCase } from "../login.usecase";

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
const loginUseCase = new LoginUseCase(sessionRepositoryMock, userRepositoryMock, passwordServiceMock);
const { user, passwordHash } = createUserFixture({
	user: {
		email: "test@example.com",
	},
	passwordHash: "hashed_password123",
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

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(user.id);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should return INVALID_CREDENTIALS error when user does not exist", async () => {
		userMap.clear();
		userPasswordHashMap.clear();
		sessionMap.clear();

		const result = await loginUseCase.execute("nonexistent@example.com", "password123");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should return INVALID_CREDENTIALS error when password is incorrect", async () => {
		const result = await loginUseCase.execute(user.email, "wrong_password");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should return INVALID_CREDENTIALS error when email is incorrect", async () => {
		const result = await loginUseCase.execute("incorrect@example.com", "password123");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should return INVALID_CREDENTIALS error when user has no password hash", async () => {
		userPasswordHashMap.clear();

		const result = await loginUseCase.execute(user.email, "password123");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should create and save a new session on successful login", async () => {
		const result = await loginUseCase.execute(user.email, "password123");

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
		}
	});
});
