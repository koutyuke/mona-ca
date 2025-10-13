import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createExternalIdentity } from "../../../../domain/entities";
import { newUserId } from "../../../../domain/value-object";
import { createAccountAssociationSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	AccountAssociationSessionRepositoryMock,
	ExternalIdentityRepositoryMock,
	SessionRepositoryMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
	createAccountAssociationSessionsMap,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { AccountAssociationConfirmUseCase } from "../account-association-confirm.usecase";

const sessionMap = createSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const externalIdentityMap = createExternalIdentitiesMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const externalIdentityRepository = new ExternalIdentityRepositoryMock({
	externalIdentityMap: externalIdentityMap,
});
const accountAssociationSessionRepository = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();

const accountAssociationConfirmUseCase = new AccountAssociationConfirmUseCase(
	userRepository,
	sessionRepository,
	externalIdentityRepository,
	accountAssociationSessionRepository,
	sessionSecretHasher,
);

const { user } = createUserFixture();

describe("AccountAssociationConfirmUseCase", () => {
	beforeEach(() => {
		accountAssociationSessionMap.clear();
		externalIdentityMap.clear();
		userMap.clear();
		sessionMap.clear();
		userPasswordHashMap.clear();

		userMap.set(user.id, user);
	});

	it("should confirm account association successfully with valid code", async () => {
		// create account association session
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		userMap.set(user.id, user);
		accountAssociationSessionMap.set(accountAssociationSession.id, accountAssociationSession);

		const result = await accountAssociationConfirmUseCase.execute(
			accountAssociationSession.code!,
			accountAssociationSession,
		);

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("session");
		expect(result).toHaveProperty("sessionToken");

		if (!isErr(result)) {
			expect(result.session.userId).toBe(user.id);
			expect(typeof result.sessionToken).toBe("string");
			expect(result.sessionToken.length).toBeGreaterThan(0);
			expect(result.sessionToken.includes(".")).toBe(true);
		}

		// verify account association session is deleted
		expect(accountAssociationSessionMap.has(accountAssociationSession.id)).toBe(false);

		// verify OAuth account is created
		const savedOAuthAccount = externalIdentityMap.get(
			createExternalIdentityKey(accountAssociationSession.provider, accountAssociationSession.providerUserId),
		);
		expect(savedOAuthAccount).toBeDefined();
		expect(savedOAuthAccount?.userId).toBe(user.id);
		expect(savedOAuthAccount?.provider).toBe(accountAssociationSession.provider);
		expect(savedOAuthAccount?.providerUserId).toBe(accountAssociationSession.providerUserId);
	});

	it("should return INVALID_ASSOCIATION_CODE error when code is null", async () => {
		// create account association session without code
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: null,
				email: user.email,
			},
		});

		const result = await accountAssociationConfirmUseCase.execute("12345678", accountAssociationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_ASSOCIATION_CODE");
		}
	});

	it("should return INVALID_ASSOCIATION_CODE error when code does not match", async () => {
		// create account association session
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		const result = await accountAssociationConfirmUseCase.execute("87654321", accountAssociationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_ASSOCIATION_CODE");
		}
	});

	it("should return OAUTH_PROVIDER_ALREADY_LINKED error when user already has account for the provider", async () => {
		// create account association session
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		// create existing OAuth account for the user and provider
		const existingOAuthAccount = createExternalIdentity({
			provider: accountAssociationSession.provider,
			providerUserId: accountAssociationSession.providerUserId,
			userId: user.id,
		});

		externalIdentityMap.set(
			createExternalIdentityKey(accountAssociationSession.provider, accountAssociationSession.providerUserId),
			existingOAuthAccount,
		);

		const result = await accountAssociationConfirmUseCase.execute("12345678", accountAssociationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_PROVIDER_ALREADY_LINKED");
		}
	});

	it("should return OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER error when OAuth account is linked to another user", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		// create existing OAuth account linked to another user
		const existingOAuthAccount = createExternalIdentity({
			provider: accountAssociationSession.provider,
			providerUserId: accountAssociationSession.providerUserId,
			userId: newUserId(ulid()),
		});

		externalIdentityMap.set(
			createExternalIdentityKey(accountAssociationSession.provider, accountAssociationSession.providerUserId),
			existingOAuthAccount,
		);

		const result = await accountAssociationConfirmUseCase.execute("12345678", accountAssociationSession);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER");
		}
	});

	it("should create and save new session on successful account association", async () => {
		// create account association session
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		const result = await accountAssociationConfirmUseCase.execute("12345678", accountAssociationSession);

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const savedSession = sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(user.id);
		}
	});

	it("should create and save OAuth account on successful account association", async () => {
		// create account association session
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		const result = await accountAssociationConfirmUseCase.execute("12345678", accountAssociationSession);

		expect(isErr(result)).toBe(false);

		// verify OAuth account is saved
		const savedOAuthAccount = externalIdentityMap.get(
			createExternalIdentityKey(accountAssociationSession.provider, accountAssociationSession.providerUserId),
		);
		expect(savedOAuthAccount).toBeDefined();
		expect(savedOAuthAccount?.userId).toBe(user.id);
		expect(savedOAuthAccount?.provider).toBe(accountAssociationSession.provider);
		expect(savedOAuthAccount?.providerUserId).toBe(accountAssociationSession.providerUserId);
	});
});
