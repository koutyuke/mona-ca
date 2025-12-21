import { newUserId } from "../../../../core/domain/value-objects";
import { ulid } from "../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../core/testing/mocks/system";
import { type AccountLinkProposal, accountLinkProposalExpiresSpan } from "../../domain/entities/account-link-proposal";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../domain/value-objects/identity-providers";
import { newAccountLinkProposalId } from "../../domain/value-objects/ids";
import { type AccountLinkProposalToken, encodeToken } from "../../domain/value-objects/tokens";

const tokenSecretService = new TokenSecretServiceMock();

export const createAccountLinkProposalFixture = (override?: {
	secretHasher?: (secret: string) => Uint8Array;
	accountLinkProposal?: Partial<AccountLinkProposal>;
	accountLinkProposalSecret?: string;
}): {
	accountLinkProposal: AccountLinkProposal;
	accountLinkProposalSecret: string;
	accountLinkProposalToken: AccountLinkProposalToken;
} => {
	const secretHasher = override?.secretHasher ?? tokenSecretService.hash;

	const accountLinkProposalSecret = override?.accountLinkProposalSecret ?? "accountLinkProposalSecret";
	const secretHash = secretHasher(accountLinkProposalSecret);

	const expiresAt = new Date(
		override?.accountLinkProposal?.expiresAt?.getTime() ?? Date.now() + accountLinkProposalExpiresSpan.milliseconds(),
	);
	expiresAt.setMilliseconds(0);

	const accountLinkProposal: AccountLinkProposal = {
		id: newAccountLinkProposalId(ulid()),
		userId: newUserId(ulid()),
		code: "testCode",
		secretHash,
		email: "test.email@example.com",
		provider: newIdentityProviders("discord"),
		providerUserId: newIdentityProvidersUserId(ulid()),
		expiresAt,
		...override?.accountLinkProposal,
	};

	const accountLinkProposalToken = encodeToken(accountLinkProposal.id, accountLinkProposalSecret);

	return {
		accountLinkProposal,
		accountLinkProposalSecret,
		accountLinkProposalToken,
	};
};
