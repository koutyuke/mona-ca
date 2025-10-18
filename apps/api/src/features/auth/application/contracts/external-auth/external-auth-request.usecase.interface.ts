import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ClientType } from "../../../../../shared/domain/value-objects";

type Success = Ok<{
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
}>;

type Error = Err<"INVALID_REDIRECT_URI">;

export type ExternalAuthRequestUseCaseResult = Result<Success, Error>;

export interface IExternalAuthRequestUseCase {
	execute(production: boolean, clientType: ClientType, queryRedirectURI: string): ExternalAuthRequestUseCaseResult;
}
