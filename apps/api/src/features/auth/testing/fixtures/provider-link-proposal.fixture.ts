import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import {
	type ProviderLinkProposal,
	providerLinkProposalExpiresSpan,
} from "../../domain/entities/provider-link-proposal";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../domain/value-objects/identity-providers";
import { newProviderLinkProposalId } from "../../domain/value-objects/ids";
import { type ProviderLinkProposalToken, encodeToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createProviderLinkProposalFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	providerLinkProposal?: Partial<ProviderLinkProposal>;
	providerLinkProposalSecret?: string;
}): {
	providerLinkProposal: ProviderLinkProposal;
	providerLinkProposalSecret: string;
	providerLinkProposalToken: ProviderLinkProposalToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const providerLinkProposalSecret = override?.providerLinkProposalSecret ?? "providerLinkProposalSecret";
	const secretHash = secretHasher(providerLinkProposalSecret);

	const expiresAt = new Date(
		override?.providerLinkProposal?.expiresAt?.getTime() ?? Date.now() + providerLinkProposalExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const providerLinkProposal: ProviderLinkProposal = {
		id: newProviderLinkProposalId(ulid()),
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash,
		email: "test.email@example.com",
		provider: newIdentityProviders("discord"),
		providerUserId: newIdentityProvidersUserId(ulid()),
		expiresAt,
		...override?.providerLinkProposal,
	};

	const providerLinkProposalToken = encodeToken(providerLinkProposal.id, providerLinkProposalSecret);

	return {
		providerLinkProposal,
		providerLinkProposalSecret,
		providerLinkProposalToken,
	};
};
