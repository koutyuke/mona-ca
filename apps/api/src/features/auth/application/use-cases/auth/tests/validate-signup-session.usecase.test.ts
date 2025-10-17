import { beforeEach, describe, expect, it } from "vitest";
import { newSignupSessionToken } from "../../../../../../common/domain/value-objects";
import { createSignupSessionFixture } from "../../../../../../tests/fixtures";
import {
	SessionSecretHasherMock,
	SignupSessionRepositoryMock,
	createSignupSessionsMap,
} from "../../../../../../tests/mocks";
import { ValidateSignupSessionUseCase } from "../validate-signup-session.usecase";

const signupSessionMap = createSignupSessionsMap();

const signupSessionRepository = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();

const validateSignupSessionUseCase = new ValidateSignupSessionUseCase(signupSessionRepository, sessionSecretHasher);

const {
	signupSession: baseSignupSession,
	signupSessionSecret,
	signupSessionToken,
} = createSignupSessionFixture({
	signupSession: {
		email: "test@example.com",
		code: "12345678",
	},
});

describe("ValidateSignupSessionUseCase", () => {
	beforeEach(() => {
		signupSessionMap.clear();
		signupSessionMap.set(baseSignupSession.id, baseSignupSession);
	});

	it("should validate signup session successfully with valid token", async () => {
		const result = await validateSignupSessionUseCase.execute(signupSessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { signupSession } = result.value;
			expect(signupSession.id).toBe(baseSignupSession.id);
			expect(signupSession.email).toBe("test@example.com");
			expect(signupSession.emailVerified).toBe(false);
		}
	});

	it("should return SIGNUP_SESSION_INVALID when token format is invalid", async () => {
		const result = await validateSignupSessionUseCase.execute(newSignupSessionToken("invalid_token"));

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SIGNUP_SESSION_INVALID");
		}
	});

	it("should return SIGNUP_SESSION_INVALID when signup session does not exist", async () => {
		signupSessionMap.clear();

		const { signupSessionToken } = createSignupSessionFixture();
		const result = await validateSignupSessionUseCase.execute(signupSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SIGNUP_SESSION_INVALID");
		}
	});

	it("should return SIGNUP_SESSION_INVALID when signup session secret is invalid", async () => {
		const invalidToken = createSignupSessionFixture({
			signupSession: baseSignupSession,
			signupSessionSecret: "invalid_secret",
		}).signupSessionToken;
		const result = await validateSignupSessionUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SIGNUP_SESSION_INVALID");
		}
	});

	it("should return SIGNUP_SESSION_EXPIRED and delete session when signup session is expired", async () => {
		const expired = {
			...baseSignupSession,
			expiresAt: new Date(0),
		};
		signupSessionMap.set(expired.id, expired);

		const token = createSignupSessionFixture({
			signupSession: expired,
			signupSessionSecret,
		}).signupSessionToken;
		const result = await validateSignupSessionUseCase.execute(token);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("SIGNUP_SESSION_EXPIRED");
		}

		expect(signupSessionMap.has(expired.id)).toBe(false);
	});
});
