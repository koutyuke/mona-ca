import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { ClientPlatform } from "../../../../../../core/domain/value-objects";
import type { AccountLinkRequest } from "../../../../domain/entities/account-link-request";
import type { Session } from "../../../../domain/entities/session";
import type { IdentityProviders } from "../../../../domain/value-objects/identity-providers";
import type { AccountLinkRequestToken, SessionToken } from "../../../../domain/value-objects/tokens";

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
	| Err<"USER_INFO_GET_FAILED", { redirectURL: URL }>
	| Err<
			"ACCOUNT_LINK_REQUEST",
			{
				redirectURL: URL;
				clientPlatform: ClientPlatform;
				accountLinkRequest: AccountLinkRequest;
				accountLinkRequestToken: AccountLinkRequestToken;
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
