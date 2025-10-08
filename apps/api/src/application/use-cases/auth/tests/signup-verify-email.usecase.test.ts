import { beforeEach, describe, expect, it, vi } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { completeEmailVerificationForSignupSession, createSignupSession } from "../../../../domain/entities";
import type { SignupSession } from "../../../../domain/entities";
import type { SignupSessionId } from "../../../../domain/value-object";
import { newSignupSessionId } from "../../../../domain/value-object";
import { TooManyRequestsException } from "../../../../modules/error";
import { SignupSessionRepositoryMock, createSignupSessionsMap } from "../../../../tests/mocks";
import { SignupVerifyEmailUseCase } from "../signup-verify-email.usecase";

describe("SignupVerifyEmailUseCase", () => {
	let signupVerifyEmailUseCase: SignupVerifyEmailUseCase;
	let signupSessionRepositoryMock: SignupSessionRepositoryMock;
	let signupSession: SignupSession;
	let signupSessionId: SignupSessionId;
	let rateLimit: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		const signupSessionMap = createSignupSessionsMap();
		signupSessionRepositoryMock = new SignupSessionRepositoryMock({
			signupSessionMap,
		});
		rateLimit = vi.fn().mockResolvedValue(undefined);

		signupVerifyEmailUseCase = new SignupVerifyEmailUseCase(signupSessionRepositoryMock, rateLimit);

		signupSessionId = newSignupSessionId(ulid());
		signupSession = createSignupSession({
			id: signupSessionId,
			email: "test@example.com",
			code: "12345678",
			secretHash: new Uint8Array([1, 2, 3]),
		});

		signupSessionRepositoryMock.signupSessionMap.set(signupSessionId, signupSession);
	});

	it("should verify email when code matches", async () => {
		const result = await signupVerifyEmailUseCase.execute("12345678", signupSession);

		expect(result).toBeUndefined();
		expect(rateLimit).toHaveBeenCalledWith(signupSessionId);
		expect(signupSessionRepositoryMock.signupSessionMap.get(signupSessionId)?.emailVerified).toBe(true);
	});

	it("should return INVALID_VERIFICATION_CODE when code does not match", async () => {
		const result = await signupVerifyEmailUseCase.execute("87654321", signupSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}

		expect(signupSessionRepositoryMock.signupSessionMap.get(signupSessionId)?.emailVerified).toBe(false);
	});

	it("should return ALREADY_VERIFIED when session already has verified email", async () => {
		const verifiedSession = completeEmailVerificationForSignupSession(signupSession);

		const result = await signupVerifyEmailUseCase.execute("12345678", verifiedSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("ALREADY_VERIFIED");
		}
	});

	it("should propagate rate limit errors", async () => {
		rateLimit.mockRejectedValue(new TooManyRequestsException(1));

		await expect(signupVerifyEmailUseCase.execute("12345678", signupSession)).rejects.toEqual(
			new TooManyRequestsException(1),
		);

		expect(signupSessionRepositoryMock.signupSessionMap.get(signupSessionId)?.emailVerified).toBe(false);
	});
});
