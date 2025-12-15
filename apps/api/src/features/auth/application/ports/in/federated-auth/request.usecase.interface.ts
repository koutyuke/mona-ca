import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { ClientPlatform } from "../../../../../../core/domain/value-objects";
import type { IdentityProviders } from "../../../../domain/value-objects/identity-providers";

type Success = Ok<{
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
}>;

type Error = Err<"INVALID_REDIRECT_URI">;

export type FederatedAuthRequestUseCaseResult = Result<Success, Error>;

export interface IFederatedAuthRequestUseCase {
	execute(
		production: boolean,
		clientPlatform: ClientPlatform,
		provider: IdentityProviders,
		queryRedirectURI: string,
	): FederatedAuthRequestUseCaseResult;
}
