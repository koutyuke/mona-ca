import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { createSignupSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	PasswordServiceMock,
	SessionRepositoryMock,
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

// Repositories
const userRepositoryMock = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const sessionRepositoryMock = new SessionRepositoryMock({
	sessionMap,
});
const signupSessionRepositoryMock = new SignupSessionRepositoryMock({
	signupSessionMap,
});

// Services
const passwordServiceMock = new PasswordServiceMock();

// Use Case
const signupConfirmUseCase = new SignupConfirmUseCase(
	userRepositoryMock,
	sessionRepositoryMock,
	signupSessionRepositoryMock,
	passwordServiceMock,
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

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.user.email).toBe("test@example.com");
			expect(result.user.name).toBe("Test User");
			expect(result.session.userId).toBe(result.user.id);
			expect(result.sessionToken.length).toBeGreaterThan(0);
			expect(result.user.emailVerified).toBe(true);

			const savedUser = userMap.get(result.user.id);
			expect(savedUser).toBeDefined();

			const savedSession = sessionMap.get(result.session.id);
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

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
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

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}

		expect(signupSessionMap.has(signupSession.id)).toBe(false);
	});

	it("should hash password and save user", async () => {
		const signupSession = verifiedSignupSessionFixture();

		const result = await signupConfirmUseCase.execute(signupSession, "Hashed User", "securePassword", userGender);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedPasswordHash = userPasswordHashMap.get(result.user.id);
			expect(savedPasswordHash).toBe("hashed_securePassword");

			const savedSession = sessionMap.get(result.session.id);
			expect(savedSession?.userId).toBe(result.user.id);
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}
	});
});
