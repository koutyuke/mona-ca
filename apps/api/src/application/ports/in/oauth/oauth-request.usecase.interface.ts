import type { Err, Result } from "../../../../common/utils";
import type { ClientType } from "../../../../domain/value-object";

type Success = {
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
};

type Error = Err<"INVALID_REDIRECT_URL">;

export type OAuthRequestUseCaseResult = Result<Success, Error>;

export interface IOAuthRequestUseCase {
	execute(production: boolean, clientType: ClientType, queryRedirectURI: string): OAuthRequestUseCaseResult;
}
