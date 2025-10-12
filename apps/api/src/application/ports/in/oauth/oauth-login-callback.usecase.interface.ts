import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession, Session } from "../../../../domain/entities";
import type { ClientType, OAuthProvider } from "../../../../domain/value-object";
import type { AccountAssociationSessionToken, SessionToken } from "../../../../domain/value-object";

type Success = {
	session: Session;
	sessionToken: SessionToken;
	redirectURL: URL;
	clientType: ClientType;
};

type Error =
	| Err<"INVALID_OAUTH_STATE">
	| Err<"INVALID_REDIRECT_URL">
	| Err<"OAUTH_CREDENTIALS_INVALID">
	| Err<"FAILED_TO_FETCH_OAUTH_ACCOUNT", { redirectURL: URL }>
	| Err<"OAUTH_ACCESS_DENIED", { redirectURL: URL }>
	| Err<"OAUTH_PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"OAUTH_ACCOUNT_NOT_FOUND", { redirectURL: URL }>
	| Err<"OAUTH_ACCOUNT_INFO_INVALID", { redirectURL: URL }>
	| Err<
			"OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE",
			{
				redirectURL: URL;
				clientType: ClientType;
				accountAssociationSessionToken: AccountAssociationSessionToken;
				accountAssociationSession: AccountAssociationSession;
			}
	  >;

export type OAuthLoginCallbackUseCaseResult = Result<Success, Error>;
export interface IOAuthLoginCallbackUseCase {
	execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: OAuthProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<OAuthLoginCallbackUseCaseResult>;
}
