import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { ClientPlatform } from "../../../../../core/domain/value-objects";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";

type Success = Ok<{
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
}>;

type Error = Err<"INVALID_REDIRECT_URI">;

export type ProviderLinkRequestUseCaseResult = Result<Success, Error>;

export interface IProviderLinkRequestUseCase {
	execute(
		production: boolean,
		clientPlatform: ClientPlatform,
		provider: IdentityProviders,
		queryRedirectURI: string,
		userCredentials: UserCredentials,
	): Promise<ProviderLinkRequestUseCaseResult>;
}
