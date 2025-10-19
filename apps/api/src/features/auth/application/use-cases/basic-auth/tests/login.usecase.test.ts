import { beforeEach, describe, expect, it } from "vitest";
import { PasswordHasherMock, SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import { createAuthUserFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SessionRepositoryMock,
	createAuthUserMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { LoginUseCase } from "../login.usecase";

const sessionMap = createSessionsMap();
const authUserMap = createAuthUserMap();
const sessionRepositoryMock = new SessionRepositoryMock({
	sessionMap,
});

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();
const passwordHasher = new PasswordHasherMock();

const loginUseCase = new LoginUseCase(sessionRepositoryMock, authUserRepository, sessionSecretHasher, passwordHasher);

const password = "password123";
const passwordHash = await passwordHasher.hash(password);

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		passwordHash,
	},
});

describe("LoginUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		authUserMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("should be able to login with valid credentials", async () => {
		const result = await loginUseCase.execute(userRegistration.email, "password123");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;
			expect(session.userId).toBe(userRegistration.id);
			expect(typeof sessionToken).toBe("string");
			expect(sessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should return INVALID_CREDENTIALS error when user does not exist", async () => {
		authUserMap.clear();
		sessionMap.clear();

		const result = await loginUseCase.execute("nonexistent@example.com", "password123");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should return INVALID_CREDENTIALS error when password is incorrect", async () => {
		const result = await loginUseCase.execute(userRegistration.email, "wrong_password");

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
		const userWithoutPassword = {
			...userRegistration,
			passwordHash: null,
		};
		authUserMap.set(userWithoutPassword.id, userWithoutPassword);

		const result = await loginUseCase.execute(userRegistration.email, "password123");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CREDENTIALS");
		}
	});

	it("should create and save a new session on successful login", async () => {
		const result = await loginUseCase.execute(userRegistration.email, "password123");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session } = result.value;
			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userRegistration.id);
		}
	});
});
