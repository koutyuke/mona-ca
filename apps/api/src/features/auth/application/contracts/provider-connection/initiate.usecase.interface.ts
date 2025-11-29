import type { Err, Ok, Result } from "@mona-ca/core/utils";
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

export type ProviderConnectionInitiateUseCaseResult = Result<Success, Error>;

export interface IProviderConnectionInitiateUseCase {
	execute(
		production: boolean,
		clientPlatform: ClientPlatform,
		provider: IdentityProviders,
		queryRedirectURI: string,
		userCredentials: UserCredentials,
	): Promise<ProviderConnectionInitiateUseCaseResult>;
}
