import { assert, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { encodeToken, newProviderLinkProposalToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createProviderLinkProposalFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	ProviderLinkProposalRepositoryMock,
	createAuthUserMap,
	createProviderLinkProposalMap,
	createSessionMap,
} from "../../../../testing/mocks/repositories";
import { ProviderLinkValidateProposalUseCase } from "../validate-proposal.usecase";

const authUserMap = createAuthUserMap();
const sessionMap = createSessionMap();
const providerLinkProposalMap = createProviderLinkProposalMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const providerLinkProposalRepository = new ProviderLinkProposalRepositoryMock({
	providerLinkProposalMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const providerLinkValidateProposalUseCase = new ProviderLinkValidateProposalUseCase(
	authUserRepository,
	providerLinkProposalRepository,
	tokenSecretService,
);

const { userRegistration, userCredentials } = createAuthUserFixture();

describe("ProviderLinkValidateProposalUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		providerLinkProposalMap.clear();
		sessionMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("should validate provider link proposal successfully with valid token", async () => {
		// create provider link proposal
		const { providerLinkProposal, providerLinkProposalToken } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		const result = await providerLinkValidateProposalUseCase.execute(providerLinkProposalToken);

		expect(result.isErr).toBe(false);

		assert(result.isOk);

		const { providerLinkProposal: validatedProposal, userCredentials: validatedUserCredentials } = result.value;

		// should return expected user credentials and provider link proposal
		expect(validatedUserCredentials).toStrictEqual(userCredentials);
		expect(validatedProposal).toStrictEqual(providerLinkProposal);

		// should saved proposal
		const savedProposal = providerLinkProposalMap.get(providerLinkProposal.id);
		expect(savedProposal).toStrictEqual(providerLinkProposal);
	});

	it("should return INVALID_PROVIDER_LINK_PROPOSAL error for invalid token format", async () => {
		const invalidToken = newProviderLinkProposalToken("invalid_token_format");

		const result = await providerLinkValidateProposalUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_PROPOSAL");
	});

	it("should return INVALID_PROVIDER_LINK_PROPOSAL error for non-existent proposal", async () => {
		const { providerLinkProposalToken } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		const result = await providerLinkValidateProposalUseCase.execute(providerLinkProposalToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_PROPOSAL");
	});

	it("should return EXPIRED_PROVIDER_LINK_PROPOSAL error for expired proposal", async () => {
		// create provider link proposal that is expired
		const { providerLinkProposal, providerLinkProposalToken } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
				expiresAt: new Date(0),
			},
		});

		// save proposal
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		const result = await providerLinkValidateProposalUseCase.execute(providerLinkProposalToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("EXPIRED_PROVIDER_LINK_PROPOSAL");

		// verify proposal is deleted
		expect(providerLinkProposalMap.has(providerLinkProposal.id)).toBe(false);
	});

	it("should return INVALID_PROVIDER_LINK_PROPOSAL error for invalid proposal secret", async () => {
		// create provider link proposal
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		// create token with different secret
		const wrongSecret = "wrongSecret";
		const invalidProposalToken = encodeToken(providerLinkProposal.id, wrongSecret);

		const result = await providerLinkValidateProposalUseCase.execute(invalidProposalToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_PROPOSAL");
	});

	it("should return INVALID_PROVIDER_LINK_PROPOSAL error when user does not exist", async () => {
		// create provider link proposal
		const differentUserId = newUserId(ulid());
		const { providerLinkProposal, providerLinkProposalToken } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: differentUserId,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		// save proposal but not user
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		const result = await providerLinkValidateProposalUseCase.execute(providerLinkProposalToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_PROPOSAL");

		// verify proposal is deleted
		expect(providerLinkProposalMap.has(providerLinkProposal.id)).toBe(false);
	});

	it("should return INVALID_PROVIDER_LINK_PROPOSAL error when user email does not match", async () => {
		// create provider link proposal with different email
		const differentEmail = "different@example.com";
		const { providerLinkProposal, providerLinkProposalToken } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: "12345678",
				email: differentEmail,
			},
		});

		// save user and proposal
		providerLinkProposalMap.set(providerLinkProposal.id, providerLinkProposal);

		const result = await providerLinkValidateProposalUseCase.execute(providerLinkProposalToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_PROPOSAL");

		// verify proposal is deleted
		expect(providerLinkProposalMap.has(providerLinkProposal.id)).toBe(false);
	});
});
