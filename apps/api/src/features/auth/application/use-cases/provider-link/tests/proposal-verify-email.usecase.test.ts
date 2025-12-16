import { assert, afterEach, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createProviderAccount } from "../../../../domain/entities/provider-account";
import { createAuthUserFixture, createProviderLinkProposalFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	ProviderAccountRepositoryMock,
	ProviderLinkProposalRepositoryMock,
	SessionRepositoryMock,
	createAuthUserMap,
	createProviderAccountKey,
	createProviderAccountMap,
	createProviderLinkProposalMap,
	createSessionMap,
} from "../../../../testing/mocks/repositories";
import { ProviderLinkProposalVerifyEmailUseCase } from "../proposal-verify-email.usecase";

const sessionMap = createSessionMap();
const authUserMap = createAuthUserMap();
const providerAccountMap = createProviderAccountMap();
const providerLinkProposalMap = createProviderLinkProposalMap();

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
const providerLinkProposalRepository = new ProviderLinkProposalRepositoryMock({
	providerLinkProposalMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const providerLinkProposalVerifyEmailUseCase = new ProviderLinkProposalVerifyEmailUseCase(
	providerLinkProposalRepository,
	authUserRepository,
	providerAccountRepository,
	sessionRepository,
	tokenSecretService,
);

const { userRegistration, userCredentials } = createAuthUserFixture();

describe("ProviderLinkProposalVerifyEmailUseCase", () => {
	beforeEach(() => {
		authUserMap.set(userRegistration.id, userRegistration);
	});

	afterEach(() => {
		providerLinkProposalMap.clear();
		providerAccountMap.clear();
		authUserMap.clear();
		sessionMap.clear();
	});

	it("should complete provider link proposal successfully with valid code", async () => {
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		const result = await providerLinkProposalVerifyEmailUseCase.execute(
			providerLinkProposal.code ?? "",
			userCredentials,
			providerLinkProposal,
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
		expect(providerLinkProposalMap.has(providerLinkProposal.id)).toBe(false);

		// check provider account is created
		const savedProviderAccount = providerAccountMap.get(
			createProviderAccountKey(providerLinkProposal.provider, providerLinkProposal.providerUserId),
		);
		expect(savedProviderAccount?.provider).toBe(providerLinkProposal.provider);
		expect(savedProviderAccount?.providerUserId).toBe(providerLinkProposal.providerUserId);
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
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		const result = await providerLinkProposalVerifyEmailUseCase.execute(
			"12345678",
			userCredentials,
			providerLinkProposal,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);

		expect(result.code).toBe("INVALID_CODE");
	});

	it("should return INVALID_CODE error when code does not match", async () => {
		// create provider link proposal
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		const result = await providerLinkProposalVerifyEmailUseCase.execute(
			"87654321",
			userCredentials,
			providerLinkProposal,
		);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_CODE");
	});

	it("should return PROVIDER_ALREADY_LINKED error when user already has account for the provider", async () => {
		// create provider link proposal
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		// create existing provider account for the user and provider
		const existingProviderAccount = createProviderAccount({
			provider: providerLinkProposal.provider,
			providerUserId: providerLinkProposal.providerUserId,
			userId: userRegistration.id,
		});

		providerAccountMap.set(
			createProviderAccountKey(providerLinkProposal.provider, providerLinkProposal.providerUserId),
			existingProviderAccount,
		);

		const result = await providerLinkProposalVerifyEmailUseCase.execute(
			"12345678",
			userCredentials,
			providerLinkProposal,
		);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("PROVIDER_ALREADY_LINKED");
	});

	it("should return ACCOUNT_LINKED_ELSEWHERE error when provider account is linked to another user", async () => {
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		// create existing provider account linked to another user
		const existingProviderAccount = createProviderAccount({
			provider: providerLinkProposal.provider,
			providerUserId: providerLinkProposal.providerUserId,
			userId: newUserId(ulid()),
		});

		providerAccountMap.set(
			createProviderAccountKey(providerLinkProposal.provider, providerLinkProposal.providerUserId),
			existingProviderAccount,
		);

		const result = await providerLinkProposalVerifyEmailUseCase.execute(
			"12345678",
			userCredentials,
			providerLinkProposal,
		);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINKED_ELSEWHERE");
	});
});
