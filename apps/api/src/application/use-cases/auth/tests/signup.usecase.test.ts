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
import { SignupUseCase } from "../signup.usecase";

describe("SignupUseCase", () => {
	let signupUseCase: SignupUseCase;
	let sessionRepositoryMock: SessionRepositoryMock;
	let userRepositoryMock: UserRepositoryMock;
	let passwordServiceMock: PasswordServiceMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap();

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

		signupUseCase = new SignupUseCase(
			sessionRepositoryMock,
			userRepositoryMock,
			passwordServiceMock,
			sessionSecretServiceMock,
		);
	});

	it("should be able to signup", async () => {
		const result = await signupUseCase.execute("test_user", "test@example.com", "password123", newGender("man"));

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("user");
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.user.name).toBe("test_user");
			expect(result.user.email).toBe("test@example.com");
			expect(result.user.gender).toBe(newGender("man"));
			expect(result.user.emailVerified).toBe(false);
			expect(result.user.iconUrl).toBe(null);
		}
	});

	it("should return EMAIL_ALREADY_REGISTERED error if the user with the same email already exists", async () => {
		// create existing user
		const existingUserId = newUserId(ulid());
		const existingUser = createUser({
			id: existingUserId,
			name: "existing_user",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		userRepositoryMock.userMap.set(existingUserId, existingUser);

		const result = await signupUseCase.execute("new_user", "test@example.com", "password123", newGender("woman"));

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toEqual("EMAIL_ALREADY_REGISTERED");
		}
	});

	it("should delete the existing user and create a new user if the existing user has emailVerified false", async () => {
		// create existing user
		const existingUserId = newUserId(ulid());
		const existingUser = createUser({
			id: existingUserId,
			name: "existing_user",
			email: "test@example.com",
			emailVerified: false,
			iconUrl: null,
			gender: newGender("man"),
		});

		userRepositoryMock.userMap.set(existingUserId, existingUser);

		const result = await signupUseCase.execute("new_user", "test@example.com", "password123", newGender("woman"));

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("user");
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		// check if the existing user is deleted
		expect(userRepositoryMock.userMap.get(existingUserId)).toBe(undefined);

		if (!isErr(result)) {
			expect(result.user.name).toBe("new_user");
			expect(result.user.email).toBe("test@example.com");
			expect(result.user.gender).toBe(newGender("woman"));
			expect(result.user.emailVerified).toBe(false);
			expect(result.user.iconUrl).toBe(null);
		}
	});

	it("should hash the password and save it with the user", async () => {
		const result = await signupUseCase.execute("test_user", "test@example.com", "password123", newGender("man"));

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedPasswordHash = userRepositoryMock.userPasswordHashMap.get(result.user.id);
			expect(savedPasswordHash).toBe("hashed_password123");
		}
	});

	it("should create a session and save it", async () => {
		const result = await signupUseCase.execute("test_user", "test@example.com", "password123", newGender("man"));

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			const savedSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(result.session.userId);
		}
	});

	it("should generate a session token in the correct format", async () => {
		const result = await signupUseCase.execute("test_user", "test@example.com", "password123", newGender("man"));

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}
	});
});
