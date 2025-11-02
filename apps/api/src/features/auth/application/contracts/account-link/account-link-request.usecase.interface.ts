import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ClientType } from "../../../../../core/domain/value-objects";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";
import type { AccountLinkSessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
}>;

type Error = Err<"INVALID_REDIRECT_URI"> | Err<"ACCOUNT_LINK_SESSION_EXPIRED"> | Err<"ACCOUNT_LINK_SESSION_INVALID">;

export type AccountLinkRequestUseCaseResult = Result<Success, Error>;

export interface IAccountLinkRequestUseCase {
	execute(
		production: boolean,
		clientType: ClientType,
		provider: ExternalIdentityProvider,
		queryRedirectURI: string,
		accountLinkSessionToken: AccountLinkSessionToken,
	): Promise<AccountLinkRequestUseCaseResult>;
}
