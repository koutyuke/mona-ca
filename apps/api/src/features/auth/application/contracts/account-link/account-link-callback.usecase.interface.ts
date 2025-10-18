import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ClientType } from "../../../../../common/domain/value-objects";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";

type Success = Ok<{
	redirectURL: URL;
	clientType: ClientType;
}>;

type Error =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URI">
	| Err<"PROVIDER_ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"TOKEN_EXCHANGE_FAILED">
	| Err<"GET_IDENTITY_FAILED", { redirectURL: URL }>
	| Err<"PROVIDER_ALREADY_LINKED", { redirectURL: URL }>
	| Err<"ACCOUNT_LINKED_ELSEWHERE", { redirectURL: URL }>;

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
