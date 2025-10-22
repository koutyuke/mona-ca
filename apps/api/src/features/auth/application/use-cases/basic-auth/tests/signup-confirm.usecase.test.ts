import { afterEach, describe, expect, it } from "vitest";
import { newGender, newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { PasswordHasherMock, SessionSecretHasherMock } from "../../../../../../core/testing/mocks/system";
import { createUserRegistration } from "../../../../domain/entities/user-registration";
import { createSignupSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SessionRepositoryMock,
	SignupSessionRepositoryMock,
	createAuthUsersMap,
	createSessionsMap,
	createSignupSessionsMap,
} from "../../../../testing/mocks/repositories";
import { SignupConfirmUseCase } from "../signup-confirm.usecase";

// Maps
const sessionMap = createSessionsMap();
const authUserMap = createAuthUsersMap();
const signupSessionMap = createSignupSessionsMap();

// Mocks
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const signupSessionRepository = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();
const passwordHasher = new PasswordHasherMock();

// Use Case
const signupConfirmUseCase = new SignupConfirmUseCase(
	authUserRepository,
	sessionRepository,
	signupSessionRepository,
	sessionSecretHasher,
	passwordHasher,
);

describe("SignupConfirmUseCase", () => {
	afterEach(() => {
		sessionMap.clear();
		authUserMap.clear();
		signupSessionMap.clear();
	});

	it("should create user and session when signup session is verified", async () => {
		const { signupSession } = createSignupSessionFixture({
			signupSession: {
				email: "test@example.com",
				emailVerified: true,
				code: "12345678",
			},
		});

		signupSessionMap.set(signupSession.id, signupSession);

		const result = await signupConfirmUseCase.execute(
			signupSession,
			"Test User",
			"password123",
			newGender("woman" as const),
		);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;
			expect(sessionToken.length).toBeGreaterThan(0);

			const savedUser = Array.from(authUserMap.values()).find(u => u.email === "test@example.com");
			expect(savedUser).toBeDefined();
			expect(savedUser?.name).toBe("Test User");
			expect(savedUser?.email).toBe("test@example.com");
			expect(savedUser?.emailVerified).toBe(true);
			expect(session.userId).toBe(savedUser?.id);

			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
		}

		expect(signupSessionMap.has(signupSession.id)).toBe(false);
	});

	it("should return EMAIL_VERIFICATION_REQUIRED when email is not verified", async () => {
		const { signupSession } = createSignupSessionFixture({
			signupSession: {
				email: "test@example.com",
				code: "12345678",
				emailVerified: false,
			},
		});

		const result = await signupConfirmUseCase.execute(
			signupSession,
			"Test User",
			"password123",
			newGender("man" as const),
		);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_VERIFICATION_REQUIRED");
		}
	});

	it("should return EMAIL_ALREADY_REGISTERED when email already exists", async () => {
		const { signupSession } = createSignupSessionFixture({
			signupSession: {
				email: "test@example.com",
				emailVerified: true,
				code: "12345678",
			},
		});

		signupSessionMap.set(signupSession.id, signupSession);

		const existingUser = createUserRegistration({
			id: newUserId(ulid()),
			email: signupSession.email,
			name: "Existing User",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man" as const),
			passwordHash: "hashedPassword",
		});

		authUserMap.set(existingUser.id, existingUser);

		const result = await signupConfirmUseCase.execute(signupSession, "Another User", "password123", newGender("man"));

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}

		expect(signupSessionMap.has(signupSession.id)).toBe(false);
	});

	it("should hash password and save user", async () => {
		const { signupSession } = createSignupSessionFixture({
			signupSession: {
				email: "test@example.com",
				emailVerified: true,
				code: "12345678",
			},
		});

		signupSessionMap.set(signupSession.id, signupSession);

		const result = await signupConfirmUseCase.execute(
			signupSession,
			"Hashed User",
			"securePassword",
			newGender("man" as const),
		);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;

			const savedUser = Array.from(authUserMap.values()).find(u => u.email === "test@example.com");
			expect(savedUser).toBeDefined();
			expect(savedUser?.passwordHash).toBe("__password-hashed:securePassword");

			const savedSession = sessionMap.get(session.id);
			expect(savedSession?.userId).toBe(savedUser?.id);
			expect(sessionToken.length).toBeGreaterThan(0);
		}
	});
});
