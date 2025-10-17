import { beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../common/domain/value-objects";
import { ulid } from "../../../../../../lib/utils";
import { createAccountAssociationSessionFixture, createUserFixture } from "../../../../../../tests/fixtures";
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
} from "../../../../../../tests/mocks";
import { createExternalIdentity } from "../../../../domain/entities";
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

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;
			expect(session.userId).toBe(user.id);
			expect(typeof sessionToken).toBe("string");
			expect(sessionToken.length).toBeGreaterThan(0);
			expect(sessionToken.includes(".")).toBe(true);
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

		expect(result.isErr).toBe(true);

		if (result.isErr) {
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

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_ASSOCIATION_CODE");
		}
	});

	it("should return ACCOUNT_ALREADY_LINKED error when user already has account for the provider", async () => {
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

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ALREADY_LINKED");
		}
	});

	it("should return ACCOUNT_LINKED_ELSEWHERE error when OAuth account is linked to another user", async () => {
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

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINKED_ELSEWHERE");
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

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session } = result.value;
			const savedSession = sessionMap.get(session.id);
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

		expect(result.isErr).toBe(false);

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
