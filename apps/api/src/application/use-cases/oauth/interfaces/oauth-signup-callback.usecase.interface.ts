import type { Err, Result } from "../../../../common/utils";
import type { Session } from "../../../../domain/entities";
import type { ClientType, OAuthProvider, OAuthProviderId, UserId } from "../../../../domain/value-object";

export type OAuthSignupCallbackUseCaseSuccessResult = {
	session: Session;
	sessionToken: string;
	redirectURL: URL;
	clientType: ClientType;
};

export type OAuthSignupCallbackUseCaseErrorResult =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URL">
	| Err<"CODE_NOT_FOUND">
	| Err<"FAILED_TO_GET_ACCOUNT_INFO", { redirectURL: URL }>
	| Err<"ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"ACCOUNT_IS_ALREADY_USED", { redirectURL: URL }>
	| Err<
			"EMAIL_ALREADY_EXISTS_BUT_LINKABLE",
			{
				redirectURL: URL;
				userId: UserId;
				provider: OAuthProvider;
				providerId: OAuthProviderId;
				clientType: ClientType;
			}
	  >;

export type OAuthSignupCallbackUseCaseResult = Result<
	OAuthSignupCallbackUseCaseSuccessResult,
	OAuthSignupCallbackUseCaseErrorResult
>;

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
