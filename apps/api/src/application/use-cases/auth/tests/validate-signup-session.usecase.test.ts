import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createSignupSession } from "../../../../domain/entities";
import type { SignupSession } from "../../../../domain/entities";
import type { SignupSessionId } from "../../../../domain/value-object";
import { newSignupSessionId } from "../../../../domain/value-object";
import { SessionSecretServiceMock, SignupSessionRepositoryMock } from "../../../../tests/mocks";
import { createSessionToken } from "../../../services/session";
import { ValidateSignupSessionUseCase } from "../validate-signup-session.usecase";

describe("ValidateSignupSessionUseCase", () => {
	let signupSessionRepositoryMock: SignupSessionRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;
	let validateSignupSessionUseCase: ValidateSignupSessionUseCase;

	beforeEach(() => {
		const signupSessionMap = new Map<SignupSessionId, SignupSession>();

		signupSessionRepositoryMock = new SignupSessionRepositoryMock({
			signupSessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		validateSignupSessionUseCase = new ValidateSignupSessionUseCase(
			signupSessionRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should validate signup session successfully with valid token", async () => {
		const signupSessionId = newSignupSessionId(ulid());
		const signupSessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const signupSessionSecretHash = sessionSecretServiceMock.hashSessionSecret(signupSessionSecret);
		const signupSession = createSignupSession({
			id: signupSessionId,
			email: "test@example.com",
			code: "12345678",
			secretHash: signupSessionSecretHash,
		});

		signupSessionRepositoryMock.signupSessionMap.set(signupSessionId, signupSession);

		const token = createSessionToken(signupSessionId, signupSessionSecret);
		const result = await validateSignupSessionUseCase.execute(token);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.signupSession.id).toBe(signupSessionId);
			expect(result.signupSession.email).toBe("test@example.com");
			expect(result.signupSession.emailVerified).toBe(false);
		}
	});

	it("should return SIGNUP_SESSION_INVALID when token format is invalid", async () => {
		const result = await validateSignupSessionUseCase.execute("invalid_token");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SIGNUP_SESSION_INVALID");
		}
	});

	it("should return SIGNUP_SESSION_INVALID when signup session does not exist", async () => {
		const signupSessionId = newSignupSessionId(ulid());
		const signupSessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const token = createSessionToken(signupSessionId, signupSessionSecret);

		const result = await validateSignupSessionUseCase.execute(token);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SIGNUP_SESSION_INVALID");
		}
	});

	it("should return SIGNUP_SESSION_INVALID when signup session secret is invalid", async () => {
		const signupSessionId = newSignupSessionId(ulid());
		const correctSecret = sessionSecretServiceMock.generateSessionSecret();
		const correctSecretHash = sessionSecretServiceMock.hashSessionSecret(correctSecret);
		const signupSession = createSignupSession({
			id: signupSessionId,
			email: "test@example.com",
			code: "12345678",
			secretHash: correctSecretHash,
		});

		signupSessionRepositoryMock.signupSessionMap.set(signupSessionId, signupSession);

		const invalidToken = createSessionToken(signupSessionId, "invalid_secret");
		const result = await validateSignupSessionUseCase.execute(invalidToken);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SIGNUP_SESSION_INVALID");
		}
	});

	it("should return SIGNUP_SESSION_EXPIRED and delete session when signup session is expired", async () => {
		const signupSessionId = newSignupSessionId(ulid());
		const signupSessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const signupSessionSecretHash = sessionSecretServiceMock.hashSessionSecret(signupSessionSecret);
		const signupSession = createSignupSession({
			id: signupSessionId,
			email: "test@example.com",
			code: "12345678",
			secretHash: signupSessionSecretHash,
		});

		signupSession.expiresAt = new Date(Date.now() - 1_000);
		signupSessionRepositoryMock.signupSessionMap.set(signupSessionId, signupSession);

		const token = createSessionToken(signupSessionId, signupSessionSecret);
		const result = await validateSignupSessionUseCase.execute(token);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("SIGNUP_SESSION_EXPIRED");
		}

		expect(signupSessionRepositoryMock.signupSessionMap.has(signupSessionId)).toBe(false);
	});
});
