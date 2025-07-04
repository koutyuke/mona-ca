import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession, Session } from "../../../../domain/entities";
import type { ClientType, OAuthProvider } from "../../../../domain/value-object";

type Success = {
	session: Session;
	sessionToken: string;
	redirectURL: URL;
	clientType: ClientType;
};

type Error =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URL">
	| Err<"CODE_NOT_FOUND">
	| Err<"FAILED_TO_GET_ACCOUNT_INFO", { redirectURL: URL }>
	| Err<"ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"ACCOUNT_IS_ALREADY_USED", { redirectURL: URL }>
	| Err<
			"EMAIL_ALREADY_USED_BUT_LINKABLE",
			{
				redirectURL: URL;
				clientType: ClientType;
				accountAssociationSessionToken: string;
				accountAssociationSession: AccountAssociationSession;
			}
	  >;

export type OAuthSignupCallbackUseCaseResult = Result<Success, Error>;

export interface IOAuthSignupCallbackUseCase {
	execute(
		error: string | undefined,
		redirectURI: string,
		provider: OAuthProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<OAuthSignupCallbackUseCaseResult>;
}
