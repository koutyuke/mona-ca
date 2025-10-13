import type { Err, Result } from "../../../../common/utils";
import type { ClientType, ExternalIdentityProvider } from "../../../../domain/value-object";

type Success = {
	redirectURL: URL;
	clientType: ClientType;
};

type Error =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URI">
	| Err<"PROVIDER_ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"TOKEN_EXCHANGE_FAILED">
	| Err<"GET_IDENTITY_FAILED", { redirectURL: URL }>
	| Err<"EXTERNAL_IDENTITY_ALREADY_LINKED", { redirectURL: URL }>
	| Err<"EXTERNAL_IDENTITY_ALREADY_LINKED_TO_ANOTHER_USER", { redirectURL: URL }>;

export type AccountLinkCallbackUseCaseResult = Result<Success, Error>;

export interface IAccountLinkCallbackUseCase {
	execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: ExternalIdentityProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<AccountLinkCallbackUseCaseResult>;
}
