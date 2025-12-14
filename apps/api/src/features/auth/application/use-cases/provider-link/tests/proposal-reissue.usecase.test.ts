import { assert, beforeEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createAuthUserFixture, createProviderLinkProposalFixture } from "../../../../testing/fixtures";
import {
	ProviderLinkProposalRepositoryMock,
	createProviderLinkProposalsMap,
} from "../../../../testing/mocks/repositories";
import { ProviderLinkProposalReissueUseCase } from "../proposal-reissue.usecase";

const providerLinkProposalMap = createProviderLinkProposalsMap();

const providerLinkProposalRepository = new ProviderLinkProposalRepositoryMock({
	providerLinkProposalMap,
});

const tokenSecretService = new TokenSecretServiceMock();
const cryptoRandomService = new CryptoRandomServiceMock();
const emailGateway = new EmailGatewayMock();

const providerLinkProposalReissueUseCase = new ProviderLinkProposalReissueUseCase(
	emailGateway,
	providerLinkProposalRepository,
	cryptoRandomService,
	tokenSecretService,
);

const { userRegistration } = createAuthUserFixture();

describe("ProviderLinkProposalReissueUseCase", () => {
	beforeEach(() => {
		providerLinkProposalMap.clear();
		emailGateway.sendVerificationEmailCalls = [];
	});

	it("should reissue provider link proposal successfully", async () => {
		const { providerLinkProposal: existingProviderLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});

		providerLinkProposalMap.set(existingProviderLinkProposal.id, existingProviderLinkProposal);

		const result = await providerLinkProposalReissueUseCase.execute(existingProviderLinkProposal);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { providerLinkProposal, providerLinkProposalToken } = result.value;

		// check new proposal
		expect(providerLinkProposal.id).not.toBe(existingProviderLinkProposal.id);
		expect(providerLinkProposal.userId).toBe(userRegistration.id);
		expect(providerLinkProposal.email).toBe(userRegistration.email);
		expect(providerLinkProposal.provider).toBe(existingProviderLinkProposal.provider);
		expect(providerLinkProposal.providerUserId).toBe(existingProviderLinkProposal.providerUserId);
		expect(providerLinkProposal.code).toBe("01234567");
		expect(providerLinkProposal.secretHash).toStrictEqual(
			new TextEncoder().encode("__token-secret-hashed:token-secret"),
		);

		// check new proposal token
		expect(providerLinkProposalToken).toBe(`${providerLinkProposal.id}.token-secret`);

		// check new proposal is saved
		const savedProposal = providerLinkProposalMap.get(providerLinkProposal.id);
		expect(savedProposal).toStrictEqual(providerLinkProposal);

		// check old proposal is deleted
		expect(providerLinkProposalMap.has(existingProviderLinkProposal.id)).toBe(false);

		// check email was sent
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(1);
		expect(emailGateway.sendVerificationEmailCalls[0]?.email).toBe(userRegistration.email);
		expect(emailGateway.sendVerificationEmailCalls[0]?.code).toBe("01234567");
	});
});
