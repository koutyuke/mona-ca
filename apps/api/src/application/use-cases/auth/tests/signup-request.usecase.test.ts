import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createSignupSession, createUser } from "../../../../domain/entities";
import { newGender, newSignupSessionId, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock, SignupSessionRepositoryMock, UserRepositoryMock } from "../../../../tests/mocks";
import {
	createSessionsMap,
	createSignupSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks/repositories/table-maps";
import { SignupRequestUseCase } from "../signup-request.usecase";

describe("SignupRequestUseCase", () => {
	let signupRequestUseCase: SignupRequestUseCase;
	let signupSessionRepositoryMock: SignupSessionRepositoryMock;
	let userRepositoryMock: UserRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap();
		const signupSessionMap = createSignupSessionsMap();

		signupSessionRepositoryMock = new SignupSessionRepositoryMock({
			signupSessionMap,
		});
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		sessionSecretServiceMock = new SessionSecretServiceMock();

		signupRequestUseCase = new SignupRequestUseCase(
			signupSessionRepositoryMock,
			userRepositoryMock,
			sessionSecretServiceMock,
		);
	});

	it("should create signup session successfully when email is not used", async () => {
		const result = await signupRequestUseCase.execute("new@example.com");

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.signupSession.email).toBe("new@example.com");
			expect(result.signupSession.emailVerified).toBe(false);
			expect(result.signupSession.code).toHaveLength(8);
			expect(result.signupSessionToken.length).toBeGreaterThan(0);
		}

		if (!isErr(result)) {
			const savedSession = signupSessionRepositoryMock.signupSessionMap.get(result.signupSession.id);
			expect(savedSession).toBeDefined();
		}
	});

	it("should return EMAIL_ALREADY_USED when email is already registered", async () => {
		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name: "Existing User",
			email: "existing@example.com",
			emailVerified: true,
			iconUrl: null,
			gender: newGender("man"),
		});

		userRepositoryMock.userMap.set(userId, user);

		const result = await signupRequestUseCase.execute("existing@example.com");

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("EMAIL_ALREADY_USED");
		}
	});

	it("should delete existing sessions before creating new one", async () => {
		const signupSessionId = newSignupSessionId(ulid());
		const signupSessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const signupSessionSecretHash = sessionSecretServiceMock.hashSessionSecret(signupSessionSecret);
		const existingSession = createSignupSession({
			id: signupSessionId,
			email: "new@example.com",
			code: "87654321",
			secretHash: signupSessionSecretHash,
		});

		signupSessionRepositoryMock.signupSessionMap.set(signupSessionId, existingSession);

		expect(signupSessionRepositoryMock.signupSessionMap.size).toBe(1);

		const result = await signupRequestUseCase.execute("new@example.com");

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(result.signupSession.id).not.toBe(signupSessionId);
		}

		expect(signupSessionRepositoryMock.signupSessionMap.has(signupSessionId)).toBe(false);
	});
});
