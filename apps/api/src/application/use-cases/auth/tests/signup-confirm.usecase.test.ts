import { beforeEach, describe, expect, it } from "vitest";
import { createSignupSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	PasswordHasherMock,
	SessionRepositoryMock,
	SessionSecretHasherMock,
	SignupSessionRepositoryMock,
	UserRepositoryMock,
} from "../../../../tests/mocks";
import {
	createSessionsMap,
	createSignupSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { SignupConfirmUseCase } from "../signup-confirm.usecase";

// Maps
const sessionMap = createSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const signupSessionMap = createSignupSessionsMap();

// Mocks
const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
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
	userRepository,
	sessionRepository,
	signupSessionRepository,
	sessionSecretHasher,
	passwordHasher,
);

const { user: verifiedUserFixture } = createUserFixture({
	user: {
		email: "test@example.com",
	},
});
const userGender = verifiedUserFixture.gender;

const verifiedSignupSessionFixture = () => {
	const { signupSession } = createSignupSessionFixture({
		signupSession: {
			email: "test@example.com",
			emailVerified: true,
			code: "12345678",
		},
	});

	signupSessionMap.set(signupSession.id, signupSession);

	return signupSession;
};

describe("SignupConfirmUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();
		signupSessionMap.clear();
	});

	it("should create user and session when signup session is verified", async () => {
		const signupSession = verifiedSignupSessionFixture();

		const result = await signupConfirmUseCase.execute(signupSession, "Test User", "password123", userGender);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { user, session, sessionToken } = result.value;
			expect(user.email).toBe("test@example.com");
			expect(user.name).toBe("Test User");
			expect(session.userId).toBe(user.id);
			expect(sessionToken.length).toBeGreaterThan(0);
			expect(user.emailVerified).toBe(true);

			const savedUser = userMap.get(user.id);
			expect(savedUser).toBeDefined();

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

		const result = await signupConfirmUseCase.execute(signupSession, "Test User", "password123", userGender);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_VERIFICATION_REQUIRED");
		}
	});

	it("should return EMAIL_ALREADY_REGISTERED when email already exists", async () => {
		const signupSession = verifiedSignupSessionFixture();
		const { user: existingUser } = createUserFixture({
			user: {
				email: signupSession.email,
				name: "Existing User",
			},
		});

		userMap.set(existingUser.id, existingUser);

		const result = await signupConfirmUseCase.execute(signupSession, "Another User", "password123", userGender);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}

		expect(signupSessionMap.has(signupSession.id)).toBe(false);
	});

	it("should hash password and save user", async () => {
		const signupSession = verifiedSignupSessionFixture();

		const result = await signupConfirmUseCase.execute(signupSession, "Hashed User", "securePassword", userGender);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { user, session, sessionToken } = result.value;
			const savedPasswordHash = userPasswordHashMap.get(user.id);
			expect(savedPasswordHash).toBe("__password-hashed:securePassword");

			const savedSession = sessionMap.get(session.id);
			expect(savedSession?.userId).toBe(user.id);
			expect(sessionToken.length).toBeGreaterThan(0);
		}
	});
});
