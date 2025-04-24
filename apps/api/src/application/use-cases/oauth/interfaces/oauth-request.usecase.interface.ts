import type { Err, Result } from "../../../../common/utils";
import type { ClientType } from "../../../../domain/value-object";

export type OAuthRequestUseCaseSuccessResult = {
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
};

export type OAuthRequestUseCaseErrorResult = Err<"INVALID_REDIRECT_URL">;

export type OAuthRequestUseCaseResult = Result<OAuthRequestUseCaseSuccessResult, OAuthRequestUseCaseErrorResult>;

export interface IOAuthRequestUseCase {
	execute(clientType: ClientType, queryRedirectURI: string): OAuthRequestUseCaseResult;
}
