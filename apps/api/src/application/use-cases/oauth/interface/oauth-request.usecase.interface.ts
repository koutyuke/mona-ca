export interface IOAuthRequestUseCaseResult {
	state: string;
	codeVerifier: string;
	redirectToClientUrl: URL;
	redirectToProviderUrl: URL;
}

export interface IOAuthRequestUseCase {
	execute(clientBaseUrl: URL, queryRedirectUrl: string): IOAuthRequestUseCaseResult;
}
