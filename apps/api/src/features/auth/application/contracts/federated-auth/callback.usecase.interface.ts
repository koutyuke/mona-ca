import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { ClientPlatform } from "../../../../../core/domain/value-objects";
import type { ProviderLinkProposal } from "../../../domain/entities/provider-link-proposal";
import type { Session } from "../../../domain/entities/session";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type { ProviderLinkProposalToken, SessionToken } from "../../../domain/value-objects/tokens";

type FederatedAuthFlow = "signup" | "login";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
	redirectURL: URL;
	clientPlatform: ClientPlatform;
	flow: FederatedAuthFlow;
}>;

type Error =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URI">
	| Err<"PROVIDER_ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"TOKEN_EXCHANGE_FAILED">
	| Err<"GET_PROVIDER_USER_FAILED", { redirectURL: URL }>
	| Err<
			"PROVIDER_LINK_PROPOSAL",
			{
				redirectURL: URL;
				clientPlatform: ClientPlatform;
				providerLinkProposal: ProviderLinkProposal;
				providerLinkProposalToken: ProviderLinkProposalToken;
			}
	  >;

export type FederatedAuthCallbackUseCaseResult = Result<Success, Error>;
export interface IFederatedAuthCallbackUseCase {
	execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: IdentityProviders,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<FederatedAuthCallbackUseCaseResult>;
}
