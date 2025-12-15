import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { ProviderLinkProposal } from "../../../../domain/entities/provider-link-proposal";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { ProviderLinkProposalToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	providerLinkProposal: ProviderLinkProposal;
	userCredentials: UserCredentials;
}>;

type Error = Err<"INVALID_PROVIDER_LINK_PROPOSAL"> | Err<"EXPIRED_PROVIDER_LINK_PROPOSAL">;

export type ProviderLinkValidateProposalUseCaseResult = Result<Success, Error>;

export interface IProviderLinkValidateProposalUseCase {
	execute(providerLinkProposalToken: ProviderLinkProposalToken): Promise<ProviderLinkValidateProposalUseCaseResult>;
}
