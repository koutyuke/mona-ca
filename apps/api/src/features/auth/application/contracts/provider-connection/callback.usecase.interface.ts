import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ClientPlatform } from "../../../../../core/domain/value-objects";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";

type Success = Ok<{
	redirectURL: URL;
	clientPlatform: ClientPlatform;
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

export type ProviderConnectionCallbackUseCaseResult = Result<Success, Error>;

export interface IProviderConnectionCallbackUseCase {
	execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: IdentityProviders,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<ProviderConnectionCallbackUseCaseResult>;
}
