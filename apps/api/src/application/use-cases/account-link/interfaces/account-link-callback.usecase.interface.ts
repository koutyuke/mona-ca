import type { Err, Result } from "../../../../common/utils";
import type { ClientType, OAuthProvider } from "../../../../domain/value-object";

export type AccountLinkCallbackUseCaseSuccessResult = {
	redirectURL: URL;
	clientType: ClientType;
};

export type AccountLinkCallbackUseCaseErrorResult =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URL">
	| Err<"CODE_NOT_FOUND">
	| Err<"FAILED_TO_GET_ACCOUNT_INFO", { redirectURL: URL }>
	| Err<"ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"PROVIDER_ALREADY_LINKED", { redirectURL: URL }>
	| Err<"ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER", { redirectURL: URL }>;

export type AccountLinkCallbackUseCaseResult = Result<
	AccountLinkCallbackUseCaseSuccessResult,
	AccountLinkCallbackUseCaseErrorResult
>;

export interface IAccountLinkCallbackUseCase {
	execute(
		error: string | undefined,
		redirectURI: string,
		provider: OAuthProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<AccountLinkCallbackUseCaseResult>;
}
