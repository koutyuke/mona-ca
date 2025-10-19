import { beforeEach, describe, expect, it } from "vitest";
import { RandomGeneratorMock, SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import { createAuthUserFixture, createSignupSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SignupSessionRepositoryMock,
	createAuthUsersMap,
	createSessionsMap,
	createSignupSessionsMap,
} from "../../../../testing/mocks/repositories";
import { SignupRequestUseCase } from "../signup-request.usecase";

// Maps
const sessionMap = createSessionsMap();
const authUserMap = createAuthUsersMap();
const signupSessionMap = createSignupSessionsMap();

// Mocks
const signupSessionRepository = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();
const randomGenerator = new RandomGeneratorMock();

// Use Case
const signupRequestUseCase = new SignupRequestUseCase(
	signupSessionRepository,
	authUserRepository,
	sessionSecretHasher,
	randomGenerator,
);

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "existing@example.com",
		name: "Existing User",
	},
});

describe("SignupRequestUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		authUserMap.clear();
		signupSessionMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("should create signup session successfully when email is not used", async () => {
		const result = await signupRequestUseCase.execute("new@example.com");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { signupSession, signupSessionToken } = result.value;
			expect(signupSession.email).toBe("new@example.com");
			expect(signupSession.emailVerified).toBe(false);
			expect(signupSession.code).toHaveLength(8);
			expect(signupSessionToken.length).toBeGreaterThan(0);

			const savedSession = signupSessionMap.get(signupSession.id);
			expect(savedSession).toBeDefined();
		}
	});

	it("should return EMAIL_ALREADY_USED when email is already registered", async () => {
		const result = await signupRequestUseCase.execute("existing@example.com");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_USED");
		}
	});

	it("should delete existing sessions before creating new one", async () => {
		const { signupSession: existingSignupSession } = createSignupSessionFixture({
			signupSession: {
				email: "new@example.com",
				code: "87654321",
			},
			signupSessionSecret: "existingSecret",
		});

		signupSessionMap.set(existingSignupSession.id, existingSignupSession);

		expect(signupSessionMap.size).toBe(1);

		const result = await signupRequestUseCase.execute("new@example.com");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { signupSession } = result.value;
			expect(signupSessionMap.size).toBe(1);
			expect(signupSession.id).not.toBe(existingSignupSession.id);
			expect(signupSessionMap.has(existingSignupSession.id)).toBe(false);
		}
	});
});
