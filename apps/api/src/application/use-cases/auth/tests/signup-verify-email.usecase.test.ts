import { beforeEach, describe, expect, it, vi } from "vitest";
import { isErr } from "../../../../common/utils";
import { TooManyRequestsException } from "../../../../modules/error";
import { createSignupSessionFixture } from "../../../../tests/fixtures";
import { SignupSessionRepositoryMock, createSignupSessionsMap } from "../../../../tests/mocks";
import { SignupVerifyEmailUseCase } from "../signup-verify-email.usecase";

const signupSessionMap = createSignupSessionsMap();
const signupSessionRepositoryMock = new SignupSessionRepositoryMock({
	signupSessionMap,
});
const rateLimit = vi.fn().mockResolvedValue(undefined);
const signupVerifyEmailUseCase = new SignupVerifyEmailUseCase(signupSessionRepositoryMock, rateLimit);

const { signupSession: baseSignupSession } = createSignupSessionFixture({
	signupSession: {
		email: "test@example.com",
		code: "12345678",
	},
});

describe("SignupVerifyEmailUseCase", () => {
	beforeEach(() => {
		signupSessionMap.clear();
		rateLimit.mockClear();

		signupSessionMap.set(baseSignupSession.id, baseSignupSession);
	});

	it("should verify email when code matches", async () => {
		const result = await signupVerifyEmailUseCase.execute("12345678", baseSignupSession);

		expect(result).toBeUndefined();
		expect(rateLimit).toHaveBeenCalledWith(baseSignupSession.id);
		expect(signupSessionMap.get(baseSignupSession.id)?.emailVerified).toBe(true);
	});

	it("should update signup session expires at if success", async () => {
		const result = await signupVerifyEmailUseCase.execute("12345678", baseSignupSession);

		expect(isErr(result)).toBe(false);

		expect(signupSessionMap.get(baseSignupSession.id)?.expiresAt.getTime()).toBeGreaterThan(
			baseSignupSession.expiresAt.getTime(),
		);
	});

	it("should return INVALID_VERIFICATION_CODE when code does not match", async () => {
		const result = await signupVerifyEmailUseCase.execute("87654321", baseSignupSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
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

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ALREADY_VERIFIED");
		}
	});

	it("should propagate rate limit errors", async () => {
		rateLimit.mockRejectedValue(new TooManyRequestsException(1));

		await expect(signupVerifyEmailUseCase.execute("12345678", baseSignupSession)).rejects.toEqual(
			new TooManyRequestsException(1),
		);

		expect(signupSessionMap.get(baseSignupSession.id)?.emailVerified).toBe(false);
	});
});
