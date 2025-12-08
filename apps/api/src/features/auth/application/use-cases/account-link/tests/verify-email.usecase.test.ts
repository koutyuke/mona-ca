import { assert, afterEach, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createProviderAccount } from "../../../../domain/entities/provider-account";
import { createAccountLinkSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import {
	AccountLinkSessionRepositoryMock,
	AuthUserRepositoryMock,
	ProviderAccountRepositoryMock,
	SessionRepositoryMock,
	createAccountLinkSessionsMap,
	createAuthUsersMap,
	createProviderAccountKey,
	createProviderAccountsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { AccountLinkVerifyEmailUseCase } from "../verify-email.usecase";

const sessionMap = createSessionsMap();
const authUserMap = createAuthUsersMap();
const providerAccountMap = createProviderAccountsMap();
const accountLinkSessionMap = createAccountLinkSessionsMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const providerAccountRepository = new ProviderAccountRepositoryMock({
	providerAccountMap,
});
const accountLinkSessionRepository = new AccountLinkSessionRepositoryMock({
	accountLinkSessionMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const accountLinkVerifyEmailUseCase = new AccountLinkVerifyEmailUseCase(
	accountLinkSessionRepository,
	authUserRepository,
	providerAccountRepository,
	sessionRepository,
	tokenSecretService,
);

const { userRegistration, userCredentials } = createAuthUserFixture();

describe("AccountLinkVerifyEmailUseCase", () => {
	beforeEach(() => {
		authUserMap.set(userRegistration.id, userRegistration);
	});

	afterEach(() => {
		accountLinkSessionMap.clear();
		providerAccountMap.clear();
		authUserMap.clear();
		sessionMap.clear();
	});

	it("should complete account link successfully with valid code", async () => {
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const result = await accountLinkVerifyEmailUseCase.execute(
			accountLinkSession.code ?? "",
			userCredentials,
			accountLinkSession,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken } = result.value;

		// check session
		expect(session.id).toBeDefined();
		expect(session.userId).toBe(userRegistration.id);
		expect(session.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check session token
		expect(sessionToken).toBe(`${session.id}.token-secret`);

		// check account link session is deleted
		expect(accountLinkSessionMap.has(accountLinkSession.id)).toBe(false);

		// check provider account is created
		const savedProviderAccount = providerAccountMap.get(
			createProviderAccountKey(accountLinkSession.provider, accountLinkSession.providerUserId),
		);
		expect(savedProviderAccount?.provider).toBe(accountLinkSession.provider);
		expect(savedProviderAccount?.providerUserId).toBe(accountLinkSession.providerUserId);
		expect(savedProviderAccount?.userId).toBe(userRegistration.id);
		expect(savedProviderAccount?.linkedAt).toBeDefined();

		// check session is saved
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toStrictEqual(session);

		// check user credentials are updated
		const updatedUserCredentials = authUserMap.get(userRegistration.id);
		assert(updatedUserCredentials);
		expect(updatedUserCredentials.emailVerified).toBe(true);
	});

	it("should return INVALID_ASSOCIATION_CODE error when code is null", async () => {
		// create account link session without code
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const result = await accountLinkVerifyEmailUseCase.execute("12345678", userCredentials, accountLinkSession);

		expect(result.isErr).toBe(true);
		assert(result.isErr);

		expect(result.code).toBe("INVALID_ASSOCIATION_CODE");
	});

	it("should return INVALID_ASSOCIATION_CODE error when code does not match", async () => {
		// create account link session
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const result = await accountLinkVerifyEmailUseCase.execute("87654321", userCredentials, accountLinkSession);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_ASSOCIATION_CODE");
	});

	it("should return ACCOUNT_ALREADY_LINKED error when user already has account for the provider", async () => {
		// create account link session
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		// create existing provider account for the user and provider
		const existingProviderAccount = createProviderAccount({
			provider: accountLinkSession.provider,
			providerUserId: accountLinkSession.providerUserId,
			userId: userRegistration.id,
		});

		providerAccountMap.set(
			createProviderAccountKey(accountLinkSession.provider, accountLinkSession.providerUserId),
			existingProviderAccount,
		);

		const result = await accountLinkVerifyEmailUseCase.execute("12345678", userCredentials, accountLinkSession);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_ALREADY_LINKED");
	});

	it("should return ACCOUNT_LINKED_ELSEWHERE error when provider account is linked to another user", async () => {
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		// create existing provider account linked to another user
		const existingProviderAccount = createProviderAccount({
			provider: accountLinkSession.provider,
			providerUserId: accountLinkSession.providerUserId,
			userId: newUserId(ulid()),
		});

		providerAccountMap.set(
			createProviderAccountKey(accountLinkSession.provider, accountLinkSession.providerUserId),
			existingProviderAccount,
		);

		const result = await accountLinkVerifyEmailUseCase.execute("12345678", userCredentials, accountLinkSession);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINKED_ELSEWHERE");
	});
});
