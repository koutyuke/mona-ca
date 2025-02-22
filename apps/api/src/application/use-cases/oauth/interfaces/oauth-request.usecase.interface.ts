import type { Err, Result } from "../../../../common/utils";

export type OAuthRequestUseCaseSuccessResult = {
	state: string;
	codeVerifier: string;
	redirectToClientUrl: URL;
	redirectToProviderUrl: URL;
};

export type OAuthRequestUseCaseErrorResult = Err<"INVALID_REDIRECT_URL">;

export type OAuthRequestUseCaseResult = Result<OAuthRequestUseCaseSuccessResult, OAuthRequestUseCaseErrorResult>;

export interface IOAuthRequestUseCase {
	execute(clientBaseUrl: URL, queryRedirectUrl: string): OAuthRequestUseCaseResult;
}
