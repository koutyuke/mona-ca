import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { newSignupSessionToken } from "../../../../domain/value-object";
import { createSignupSessionFixture } from "../../../../tests/fixtures";
import { SignupSessionRepositoryMock, createSignupSessionsMap } from "../../../../tests/mocks";
import { ValidateSignupSessionUseCase } from "../validate-signup-session.usecase";

const signupSessionMap = createSignupSessionsMap();
const signupSessionRepositoryMock = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const validateSignupSessionUseCase = new ValidateSignupSessionUseCase(signupSessionRepositoryMock);

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

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.signupSession.id).toBe(baseSignupSession.id);
			expect(result.signupSession.email).toBe("test@example.com");
			expect(result.signupSession.emailVerified).toBe(false);
		}
	});

	it("should return SIGNUP_SESSION_INVALID when token format is invalid", async () => {
		const result = await validateSignupSessionUseCase.execute(newSignupSessionToken("invalid_token"));

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SIGNUP_SESSION_INVALID");
		}
	});

	it("should return SIGNUP_SESSION_INVALID when signup session does not exist", async () => {
		signupSessionMap.clear();

		const { signupSessionToken } = createSignupSessionFixture();
		const result = await validateSignupSessionUseCase.execute(signupSessionToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SIGNUP_SESSION_INVALID");
		}
	});

	it("should return SIGNUP_SESSION_INVALID when signup session secret is invalid", async () => {
		const invalidToken = createSignupSessionFixture({
			signupSession: baseSignupSession,
			signupSessionSecret: "invalid_secret",
		}).signupSessionToken;
		const result = await validateSignupSessionUseCase.execute(invalidToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
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

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SIGNUP_SESSION_EXPIRED");
		}

		expect(signupSessionMap.has(expired.id)).toBe(false);
	});
});
