import { assert, afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSignupSessionFixture } from "../../../../testing/fixtures";
import { SignupSessionRepositoryMock, createSignupSessionsMap } from "../../../../testing/mocks/repositories";
import { SignupVerifyCodeUseCase } from "../verify-code.usecase";

const signupSessionMap = createSignupSessionsMap();
const signupSessionRepositoryMock = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const signupVerifyCodeUseCase = new SignupVerifyCodeUseCase(signupSessionRepositoryMock);

const { signupSession: baseSignupSession } = createSignupSessionFixture({
	signupSession: {
		email: "test@example.com",
		code: "12345678",
	},
});

const CORRECT_CODE = "12345678";
const WRONG_CODE = "87654321";

describe("SignupVerifyCodeUseCase", () => {
	beforeEach(() => {
		signupSessionMap.set(baseSignupSession.id, baseSignupSession);
	});

	afterEach(() => {
		signupSessionMap.clear();
	});

	it("Success: should verify code and update emailVerified to true", async () => {
		const result = await signupVerifyCodeUseCase.execute(CORRECT_CODE, baseSignupSession);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const updatedSession = signupSessionMap.get(baseSignupSession.id);
		expect(updatedSession).toBeDefined();
		assert(updatedSession);

		expect(updatedSession.emailVerified).toBe(true);
		expect(updatedSession.id).toBe(baseSignupSession.id);
		expect(updatedSession.code).toBe(CORRECT_CODE);
		expect(updatedSession.email).toBe(baseSignupSession.email);
	});

	it("Success: should extend session expiration time after successful verification", async () => {
		const originalExpiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10分後
		const { signupSession: session } = createSignupSessionFixture({
			signupSession: {
				email: "test@example.com",
				code: CORRECT_CODE,
				expiresAt: originalExpiresAt,
			},
		});

		signupSessionMap.set(session.id, session);

		const result = await signupVerifyCodeUseCase.execute(CORRECT_CODE, session);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const updatedSession = signupSessionMap.get(session.id);
		expect(updatedSession).toBeDefined();
		assert(updatedSession);

		// セキュリティ: 認証成功後、セッションの有効期限が延長されること
		expect(updatedSession.expiresAt.getTime()).toBeGreaterThan(originalExpiresAt.getTime());
		expect(updatedSession.emailVerified).toBe(true);
	});

	it("Error: should return INVALID_VERIFICATION_CODE error when code does not match", async () => {
		const result = await signupVerifyCodeUseCase.execute(WRONG_CODE, baseSignupSession);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");

		// セッションが更新されていないこと
		const updatedSession = signupSessionMap.get(baseSignupSession.id);
		expect(updatedSession).toBeDefined();
		assert(updatedSession);
		expect(updatedSession.emailVerified).toBe(false);
		expect(updatedSession.code).toBe(CORRECT_CODE);
	});

	it("Error: should return INVALID_VERIFICATION_CODE error when code is empty", async () => {
		const result = await signupVerifyCodeUseCase.execute("", baseSignupSession);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");

		const updatedSession = signupSessionMap.get(baseSignupSession.id);
		expect(updatedSession?.emailVerified).toBe(false);
	});

	it("Error: should return INVALID_VERIFICATION_CODE error when code is partially matched", async () => {
		const partialCode = CORRECT_CODE.slice(0, 4);
		const result = await signupVerifyCodeUseCase.execute(partialCode, baseSignupSession);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");

		const updatedSession = signupSessionMap.get(baseSignupSession.id);
		expect(updatedSession?.emailVerified).toBe(false);
	});

	it("Error: should return ALREADY_VERIFIED error when session already has verified email", async () => {
		const updatedSignupSession = {
			...baseSignupSession,
			emailVerified: true,
		};
		signupSessionMap.set(baseSignupSession.id, updatedSignupSession);

		const result = await signupVerifyCodeUseCase.execute(CORRECT_CODE, updatedSignupSession);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("ALREADY_VERIFIED");

		// セッションが変更されていないこと
		const session = signupSessionMap.get(baseSignupSession.id);
		expect(session?.emailVerified).toBe(true);
	});
});
