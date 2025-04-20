import type { Err, Result } from "../../../../common/utils";
import type { Session } from "../../../../domain/entities";
import type { ClientType, OAuthProvider } from "../../../../domain/value-object";

export type OAuthLoginCallbackUseCaseSuccessResult = {
	session: Session;
	sessionToken: string;
	redirectURL: URL;
	clientType: ClientType;
};

export type OAuthLoginCallbackUseCaseErrorResult =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URL">
	| Err<"CODE_NOT_FOUND">
	| Err<"FAILED_TO_GET_ACCOUNT_INFO", { redirectURL: URL }>
	| Err<"ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"OAUTH_ACCOUNT_NOT_FOUND", { redirectURL: URL }>
	| Err<"OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE", { redirectURL: URL }>;

export type OAuthLoginCallbackUseCaseResult = Result<
	OAuthLoginCallbackUseCaseSuccessResult,
	OAuthLoginCallbackUseCaseErrorResult
>;
export interface IOAuthLoginCallbackUseCase {
	execute(
		error: string | undefined,
		redirectURI: string,
		provider: OAuthProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<OAuthLoginCallbackUseCaseResult>;
}
