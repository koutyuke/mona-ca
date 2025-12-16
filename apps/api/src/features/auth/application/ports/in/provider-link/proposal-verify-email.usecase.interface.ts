import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { ProviderLinkProposal } from "../../../../domain/entities/provider-link-proposal";
import type { Session } from "../../../../domain/entities/session";
import type { UserCredentials } from "../../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../../domain/value-objects/tokens";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_CODE"> | Err<"PROVIDER_ALREADY_LINKED"> | Err<"ACCOUNT_LINKED_ELSEWHERE">;

export type ProviderLinkProposalVerifyEmailUseCaseResult = Result<Success, Error>;

export interface IProviderLinkProposalVerifyEmailUseCase {
	execute(
		code: string,
		userCredentials: UserCredentials,
		providerLinkProposal: ProviderLinkProposal,
	): Promise<ProviderLinkProposalVerifyEmailUseCaseResult>;
}
