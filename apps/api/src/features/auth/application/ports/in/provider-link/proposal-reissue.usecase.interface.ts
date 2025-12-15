import type { Ok, Result } from "@mona-ca/core/result";
import type { ProviderLinkProposal } from "../../../../domain/entities/provider-link-proposal";
import type { ProviderLinkProposalToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	providerLinkProposal: ProviderLinkProposal;
	providerLinkProposalToken: ProviderLinkProposalToken;
}>;

export type ProviderLinkProposalReissueUseCaseResult = Result<Success>;

export interface IProviderLinkProposalReissueUseCase {
	execute(oldProviderLinkProposal: ProviderLinkProposal): Promise<ProviderLinkProposalReissueUseCaseResult>;
}
