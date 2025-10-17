import { beforeEach, describe, expect, it } from "vitest";
import { createSignupSessionFixture } from "../../../../../../tests/fixtures";
import { SignupSessionRepositoryMock, createSignupSessionsMap } from "../../../../../../tests/mocks";
import { SignupVerifyEmailUseCase } from "../signup-verify-email.usecase";

const signupSessionMap = createSignupSessionsMap();
const signupSessionRepositoryMock = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const signupVerifyEmailUseCase = new SignupVerifyEmailUseCase(signupSessionRepositoryMock);

const { signupSession: baseSignupSession } = createSignupSessionFixture({
	signupSession: {
		email: "test@example.com",
		code: "12345678",
	},
});

describe("SignupVerifyEmailUseCase", () => {
	beforeEach(() => {
		signupSessionMap.clear();

		signupSessionMap.set(baseSignupSession.id, baseSignupSession);
	});

	it("should verify email when code matches", async () => {
		const result = await signupVerifyEmailUseCase.execute("12345678", baseSignupSession);

		expect(result.isOk).toBe(true);
		expect(signupSessionMap.get(baseSignupSession.id)?.emailVerified).toBe(true);
	});

	it("should update signup session expires at if success", async () => {
		const result = await signupVerifyEmailUseCase.execute("12345678", baseSignupSession);

		expect(result.isErr).toBe(false);

		expect(signupSessionMap.get(baseSignupSession.id)?.expiresAt.getTime()).toBeGreaterThan(
			baseSignupSession.expiresAt.getTime(),
		);
	});

	it("should return INVALID_VERIFICATION_CODE when code does not match", async () => {
		const result = await signupVerifyEmailUseCase.execute("87654321", baseSignupSession);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}

		expect(signupSessionMap.get(baseSignupSession.id)?.emailVerified).toBe(false);
	});

	it("should return ALREADY_VERIFIED when session already has verified email", async () => {
		const updatedSignupSession = {
			...baseSignupSession,
			emailVerified: true,
		};
		signupSessionMap.set(baseSignupSession.id, updatedSignupSession);

		const result = await signupVerifyEmailUseCase.execute("12345678", updatedSignupSession);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ALREADY_VERIFIED");
		}
	});
});
