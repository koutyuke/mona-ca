import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { ClientPlatform } from "../../../../../../core/domain/value-objects";
import type { IdentityProviders } from "../../../../domain/value-objects/identity-providers";

type Success = Ok<{
	redirectURL: URL;
	clientPlatform: ClientPlatform;
}>;

type Error =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URI">
	| Err<"TOKEN_EXCHANGE_FAILED">
	| Err<"PROVIDER_ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"USER_INFO_GET_FAILED", { redirectURL: URL }>
	| Err<"PROVIDER_ALREADY_LINKED", { redirectURL: URL }>
	| Err<"ACCOUNT_LINKED_ELSEWHERE", { redirectURL: URL }>;

export type ProviderLinkCallbackUseCaseResult = Result<Success, Error>;

export interface IProviderLinkCallbackUseCase {
	execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: IdentityProviders,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<ProviderLinkCallbackUseCaseResult>;
}
