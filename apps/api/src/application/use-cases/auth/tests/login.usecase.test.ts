import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createUser } from "../../../../domain/entities";
import { newGender, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { SessionRepositoryMock } from "../../../../tests/mocks/repositories/session.repository.mock";
import {
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../tests/mocks/repositories/user.repository.mock";
import { PasswordServiceMock } from "../../../../tests/mocks/services/password.service.mock";
import { LoginUseCase } from "../login.usecase";

describe("LoginUseCase", () => {
	const userId = newUserId(ulid());
	let loginUseCase: LoginUseCase;
	let sessionRepositoryMock: SessionRepositoryMock;
	let userRepositoryMock: UserRepositoryMock;
	let passwordServiceMock: PasswordServiceMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap([
			createUser({
				id: userId,
				name: "test_user",
				email: "test@example.com",
				emailVerified: true,
				iconUrl: null,
				gender: newGender("man"),
			}),
		]);
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap([[userId, "hashed_password123"]]);

		sessionRepositoryMock = new SessionRepositoryMock({
			sessionMap,
		});
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		passwordServiceMock = new PasswordServiceMock();
		sessionSecretServiceMock = new SessionSecretServiceMock();

		loginUseCase = new LoginUseCase(
			sessionRepositoryMock,
			userRepositoryMock,
			passwordServiceMock,
			sessionSecretServiceMock,
		);
	});

	it("should be able to login with valid credentials", async () => {
		const result = await loginUseCase.execute("test@example.com", "password123");

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(userId);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should return INVALID_CREDENTIALS error when user does not exist", async () => {
		userRepositoryMock.userMap.clear();
		userRepositoryMock.userPasswordHashMap.clear();
		sessionRepositoryMock.sessionMap.clear();

		const result = await loginUseCase.execute("nonexistent@example.com", "password123");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should return INVALID_CREDENTIALS error when password is incorrect", async () => {
		const result = await loginUseCase.execute("test@example.com", "wrong_password");

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
		userRepositoryMock.userPasswordHashMap.clear();

		const result = await loginUseCase.execute("test@example.com", "password123");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should create and save a new session on successful login", async () => {
		const result = await loginUseCase.execute("test@example.com", "password123");

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userId);
		}
	});
});
