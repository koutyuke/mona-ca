import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ClientType } from "../../../../../shared/domain/value-objects";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";

type Success = Ok<{
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
}>;

type Error = Err<"INVALID_REDIRECT_URI">;

export type ExternalAuthRequestUseCaseResult = Result<Success, Error>;

export interface IExternalAuthRequestUseCase {
	execute(
		production: boolean,
		clientType: ClientType,
		provider: ExternalIdentityProvider,
		queryRedirectURI: string,
	): ExternalAuthRequestUseCaseResult;
}
