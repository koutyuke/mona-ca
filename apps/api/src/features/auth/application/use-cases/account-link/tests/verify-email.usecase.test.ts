import { assert, afterEach, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createProviderAccount } from "../../../../domain/entities/provider-account";
import { createAccountLinkRequestFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import {
	AccountLinkRequestRepositoryMock,
	AuthUserRepositoryMock,
	ProviderAccountRepositoryMock,
	SessionRepositoryMock,
	createAccountLinkRequestMap,
	createAuthUserMap,
	createProviderAccountKey,
	createProviderAccountMap,
	createSessionMap,
} from "../../../../testing/mocks/repositories";
import { AccountLinkVerifyEmailUseCase } from "../verify-email.usecase";

const sessionMap = createSessionMap();
const authUserMap = createAuthUserMap();
const providerAccountMap = createProviderAccountMap();
const accountLinkRequestMap = createAccountLinkRequestMap();

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
const accountLinkRequestRepository = new AccountLinkRequestRepositoryMock({
	accountLinkRequestMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const accountLinkVerifyEmailUseCase = new AccountLinkVerifyEmailUseCase(
	accountLinkRequestRepository,
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
		accountLinkRequestMap.clear();
		providerAccountMap.clear();
		authUserMap.clear();
		sessionMap.clear();
	});

	it("should complete provider link proposal successfully with valid code", async () => {
		const { accountLinkRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		const result = await accountLinkVerifyEmailUseCase.execute(
			accountLinkRequest.code ?? "",
			userCredentials,
			accountLinkRequest,
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

		// check provider link proposal is deleted
		expect(accountLinkRequestMap.has(accountLinkRequest.id)).toBe(false);

		// check provider account is created
		const savedProviderAccount = providerAccountMap.get(
			createProviderAccountKey(accountLinkRequest.provider, accountLinkRequest.providerUserId),
		);
		expect(savedProviderAccount?.provider).toBe(accountLinkRequest.provider);
		expect(savedProviderAccount?.providerUserId).toBe(accountLinkRequest.providerUserId);
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

	it("should return INVALID_CODE error when code is null", async () => {
		// create provider link proposal without code
		const { accountLinkRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		const result = await accountLinkVerifyEmailUseCase.execute("12345678", userCredentials, accountLinkRequest);

		expect(result.isErr).toBe(true);
		assert(result.isErr);

		expect(result.code).toBe("INVALID_CODE");
	});

	it("should return INVALID_CODE error when code does not match", async () => {
		// create provider link proposal
		const { accountLinkRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		const result = await accountLinkVerifyEmailUseCase.execute("87654321", userCredentials, accountLinkRequest);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_CODE");
	});

	it("should return PROVIDER_ALREADY_LINKED error when user already has account for the provider", async () => {
		// create provider link proposal
		const { accountLinkRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		// create existing provider account for the user and provider
		const existingProviderAccount = createProviderAccount({
			provider: accountLinkRequest.provider,
			providerUserId: accountLinkRequest.providerUserId,
			userId: userRegistration.id,
		});

		providerAccountMap.set(
			createProviderAccountKey(accountLinkRequest.provider, accountLinkRequest.providerUserId),
			existingProviderAccount,
		);

		const result = await accountLinkVerifyEmailUseCase.execute("12345678", userCredentials, accountLinkRequest);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("PROVIDER_ALREADY_LINKED");
	});

	it("should return ACCOUNT_LINKED_ELSEWHERE error when provider account is linked to another user", async () => {
		const { accountLinkRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		// create existing provider account linked to another user
		const existingProviderAccount = createProviderAccount({
			provider: accountLinkRequest.provider,
			providerUserId: accountLinkRequest.providerUserId,
			userId: newUserId(ulid()),
		});

		providerAccountMap.set(
			createProviderAccountKey(accountLinkRequest.provider, accountLinkRequest.providerUserId),
			existingProviderAccount,
		);

		const result = await accountLinkVerifyEmailUseCase.execute("12345678", userCredentials, accountLinkRequest);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINKED_ELSEWHERE");
	});
});
