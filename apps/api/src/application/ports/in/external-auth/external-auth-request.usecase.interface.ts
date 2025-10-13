import type { Err, Result } from "../../../../common/utils";
import type { ClientType } from "../../../../domain/value-object";

type Success = {
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
};

type Error = Err<"INVALID_REDIRECT_URI">;

export type ExternalAuthRequestUseCaseResult = Result<Success, Error>;

export interface IExternalAuthRequestUseCase {
	execute(production: boolean, clientType: ClientType, queryRedirectURI: string): ExternalAuthRequestUseCaseResult;
}
