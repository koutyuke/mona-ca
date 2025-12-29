import { assert, beforeEach, describe, expect, it } from "vitest";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { newSignupSessionToken } from "../../../../domain/value-objects/tokens";
import { createSignupSessionFixture } from "../../../../testing/fixtures";
import { SignupSessionRepositoryMock, createSignupSessionMap } from "../../../../testing/mocks/repositories";
import { SignupValidateSessionUseCase } from "../validate-session.usecase";

const signupSessionMap = createSignupSessionMap();

const signupSessionRepository = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const validateSignupSessionUseCase = new SignupValidateSessionUseCase(signupSessionRepository, tokenSecretService);

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

describe("SignupValidateSessionUseCase", () => {
	beforeEach(() => {
		signupSessionMap.clear();
		signupSessionMap.set(baseSignupSession.id, baseSignupSession);
	});

	it("Success: should validate signup session with valid token and return session", async () => {
		const result = await validateSignupSessionUseCase.execute(signupSessionToken);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { signupSession } = result.value;

		expect(signupSession.id).toBe(baseSignupSession.id);
		expect(signupSession.email).toBe("test@example.com");
		expect(signupSession.emailVerified).toBe(false);
		expect(signupSession.code).toBe(baseSignupSession.code);

		// セッションが削除されていないこと
		expect(signupSessionMap.has(baseSignupSession.id)).toBe(true);
	});

	it("Error: should return INVALID_SIGNUP_SESSION error when token format is invalid", async () => {
		const result = await validateSignupSessionUseCase.execute(newSignupSessionToken("invalid_token"));

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SIGNUP_SESSION");
	});

	it("Error: should return INVALID_SIGNUP_SESSION error when token is empty", async () => {
		const result = await validateSignupSessionUseCase.execute(newSignupSessionToken(""));

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SIGNUP_SESSION");
	});

	it("Error: should return INVALID_SIGNUP_SESSION error when signup session does not exist", async () => {
		signupSessionMap.clear();

		const { signupSessionToken } = createSignupSessionFixture();
		const result = await validateSignupSessionUseCase.execute(signupSessionToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SIGNUP_SESSION");
	});

	it("Error: should return INVALID_SIGNUP_SESSION error when signup session secret is invalid", async () => {
		const invalidToken = createSignupSessionFixture({
			signupSession: baseSignupSession,
			signupSessionSecret: "invalid_secret",
		}).signupSessionToken;

		const result = await validateSignupSessionUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SIGNUP_SESSION");
	});

	it("Error: should return INVALID_SIGNUP_SESSION error and delete session when signup session is expired", async () => {
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
		assert(result.isErr);
		expect(result.code).toBe("INVALID_SIGNUP_SESSION");

		// セキュリティ: 期限切れセッションは削除されること
		expect(signupSessionMap.has(expired.id)).toBe(false);
	});
});
