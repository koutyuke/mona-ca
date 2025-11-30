import { assert, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { encodeToken, newAccountLinkSessionToken } from "../../../../domain/value-objects/tokens";
import { createAccountLinkSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import {
	AccountLinkSessionRepositoryMock,
	AuthUserRepositoryMock,
	createAccountLinkSessionsMap,
	createAuthUsersMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { AccountLinkValidateSessionUseCase } from "../validate-session.usecase";

const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();
const accountLinkSessionMap = createAccountLinkSessionsMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const accountLinkSessionRepository = new AccountLinkSessionRepositoryMock({
	accountLinkSessionMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const accountLinkValidateSessionUseCase = new AccountLinkValidateSessionUseCase(
	authUserRepository,
	accountLinkSessionRepository,
	tokenSecretService,
);

const { userRegistration, userCredentials } = createAuthUserFixture();

describe("AccountLinkValidateSessionUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		accountLinkSessionMap.clear();
		sessionMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("should validate account link session successfully with valid token", async () => {
		// create account link session
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const result = await accountLinkValidateSessionUseCase.execute(accountLinkSessionToken);

		expect(result.isErr).toBe(false);

		assert(result.isOk);

		const { accountLinkSession: validatedSession, userCredentials: validatedUserCredentials } = result.value;

		// should return expected user credentials and account link session
		expect(validatedUserCredentials).toStrictEqual(userCredentials);
		expect(validatedSession).toStrictEqual(accountLinkSession);

		// should saved session
		const savedSession = accountLinkSessionMap.get(accountLinkSession.id);
		expect(savedSession).toStrictEqual(accountLinkSession);
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error for invalid token format", async () => {
		const invalidToken = newAccountLinkSessionToken("invalid_token_format");

		const result = await accountLinkValidateSessionUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error for non-existent session", async () => {
		const { accountLinkSessionToken } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		const result = await accountLinkValidateSessionUseCase.execute(accountLinkSessionToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");
	});

	it("should return ACCOUNT_LINK_SESSION_EXPIRED error for expired session", async () => {
		// create account link session that is expired
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
				expiresAt: new Date(0),
			},
		});

		// save session
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const result = await accountLinkValidateSessionUseCase.execute(accountLinkSessionToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINK_SESSION_EXPIRED");

		// verify session is deleted
		expect(accountLinkSessionMap.has(accountLinkSession.id)).toBe(false);
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error for invalid session secret", async () => {
		// create account link session
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		// create token with different secret
		const wrongSecret = "wrongSecret";
		const invalidSessionToken = encodeToken(accountLinkSession.id, wrongSecret);

		const result = await accountLinkValidateSessionUseCase.execute(invalidSessionToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error when user does not exist", async () => {
		// create account link session
		const differentUserId = newUserId(ulid());
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: differentUserId,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		// save session but not user
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const result = await accountLinkValidateSessionUseCase.execute(accountLinkSessionToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");

		// verify session is deleted
		expect(accountLinkSessionMap.has(accountLinkSession.id)).toBe(false);
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error when user email does not match", async () => {
		// create account link session with different email
		const differentEmail = "different@example.com";
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: differentEmail,
			},
		});

		// save user and session
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const result = await accountLinkValidateSessionUseCase.execute(accountLinkSessionToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");

		// verify session is deleted
		expect(accountLinkSessionMap.has(accountLinkSession.id)).toBe(false);
	});
});
