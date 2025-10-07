import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createSignupSession, createUser } from "../../../../domain/entities";
import type { SignupSession } from "../../../../domain/entities";
import { newGender, newSignupSessionId, newUserId } from "../../../../domain/value-object";
import {
	PasswordServiceMock,
	SessionRepositoryMock,
	SessionSecretServiceMock,
	SignupSessionRepositoryMock,
	UserRepositoryMock,
} from "../../../../tests/mocks";
import {
	createSessionsMap,
	createSignupSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { SignupConfirmUseCase } from "../signup-confirm.usecase";

describe("SignupConfirmUseCase", () => {
	let signupConfirmUseCase: SignupConfirmUseCase;
	let userRepositoryMock: UserRepositoryMock;
	let sessionRepositoryMock: SessionRepositoryMock;
	let signupSessionRepositoryMock: SignupSessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;
	let passwordServiceMock: PasswordServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap();
		const signupSessionMap = createSignupSessionsMap();

		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		sessionRepositoryMock = new SessionRepositoryMock({
			sessionMap,
		});
		signupSessionRepositoryMock = new SignupSessionRepositoryMock({
			signupSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();
		passwordServiceMock = new PasswordServiceMock();

		signupConfirmUseCase = new SignupConfirmUseCase(
			userRepositoryMock,
			sessionRepositoryMock,
			signupSessionRepositoryMock,
			sessionSecretServiceMock,
			passwordServiceMock,
		);
	});

	const createVerifiedSignupSession = (): SignupSession => {
		const signupSessionId = newSignupSessionId(ulid());
		const signupSessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const signupSessionSecretHash = sessionSecretServiceMock.hashSessionSecret(signupSessionSecret);
		const signupSession = createSignupSession({
			id: signupSessionId,
			email: "test@example.com",
			code: "12345678",
			secretHash: signupSessionSecretHash,
		});
		signupSession.emailVerified = true;
		signupSessionRepositoryMock.signupSessionMap.set(signupSessionId, signupSession);
		return signupSession;
	};

	it("should create user and session when signup session is verified", async () => {
		const signupSession = createVerifiedSignupSession();

		const result = await signupConfirmUseCase.execute(signupSession, "Test User", "password123", newGender("man"));

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.user.email).toBe("test@example.com");
			expect(result.user.name).toBe("Test User");
			expect(result.session.userId).toBe(result.user.id);
			expect(result.sessionToken.length).toBeGreaterThan(0);

			const savedUser = userRepositoryMock.userMap.get(result.user.id);
			expect(savedUser).toBeDefined();

			const savedSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
		}

		expect(signupSessionRepositoryMock.signupSessionMap.has(signupSession.id)).toBe(false);
	});

	it("should return EMAIL_VERIFICATION_REQUIRED when email is not verified", async () => {
		const signupSession = createSignupSession({
			id: newSignupSessionId(ulid()),
			email: "test@example.com",
			code: "12345678",
			secretHash: sessionSecretServiceMock.hashSessionSecret("secret"),
		});

		signupSession.emailVerified = false;

		const result = await signupConfirmUseCase.execute(signupSession, "Test User", "password123", newGender("man"));

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_VERIFICATION_REQUIRED");
		}
	});

	it("should return EMAIL_ALREADY_REGISTERED when email already exists", async () => {
		const signupSession = createVerifiedSignupSession();
		const existingUserId = newUserId(ulid());
		const existingUser = createUser({
			id: existingUserId,
			name: "Existing User",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		userRepositoryMock.userMap.set(existingUserId, existingUser);

		const result = await signupConfirmUseCase.execute(signupSession, "Another User", "password123", newGender("man"));

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}

		expect(signupSessionRepositoryMock.signupSessionMap.has(signupSession.id)).toBe(false);
	});

	it("should hash password and save user", async () => {
		const signupSession = createVerifiedSignupSession();
		const result = await signupConfirmUseCase.execute(
			signupSession,
			"Hashed User",
			"securePassword",
			newGender("woman"),
		);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedPasswordHash = userRepositoryMock.userPasswordHashMap.get(result.user.id);
			expect(savedPasswordHash).toBe("hashed_securePassword");

			const savedSession = sessionRepositoryMock.sessionMap.get(result.session.id);
			expect(savedSession?.userId).toBe(result.user.id);
			expect(result.sessionToken.length).toBeGreaterThan(0);
		}
	});
});
