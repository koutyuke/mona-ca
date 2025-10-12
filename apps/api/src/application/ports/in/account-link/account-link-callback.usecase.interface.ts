import type { Err, Result } from "../../../../common/utils";
import type { ClientType, OAuthProvider } from "../../../../domain/value-object";

type Success = {
	redirectURL: URL;
	clientType: ClientType;
};

type Error =
	| Err<"INVALID_REDIRECT_URL">
	| Err<"OAUTH_CREDENTIALS_INVALID">
	| Err<"FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: URL }>
	| Err<"OAUTH_ACCESS_DENIED", { redirectURL: URL }>
	| Err<"OAUTH_PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"OAUTH_PROVIDER_ALREADY_LINKED", { redirectURL: URL }>
	| Err<"OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER", { redirectURL: URL }>
	| Err<"OAUTH_ACCOUNT_INFO_INVALID", { redirectURL: URL }>;

export type AccountLinkCallbackUseCaseResult = Result<Success, Error>;

export interface IAccountLinkCallbackUseCase {
	execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: OAuthProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<AccountLinkCallbackUseCaseResult>;
}
