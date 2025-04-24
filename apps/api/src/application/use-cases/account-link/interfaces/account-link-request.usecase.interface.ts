import type { Err, Result } from "../../../../common/utils";
import type { ClientType, UserId } from "../../../../domain/value-object";

export type AccountLinkRequestUseCaseSuccessResult = {
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
};

export type AccountLinkRequestUseCaseErrorResult = Err<"INVALID_REDIRECT_URL">;

export type AccountLinkRequestUseCaseResult = Result<
	AccountLinkRequestUseCaseSuccessResult,
	AccountLinkRequestUseCaseErrorResult
>;

export interface IAccountLinkRequestUseCase {
	execute(clientType: ClientType, queryRedirectURI: string, userId: UserId): AccountLinkRequestUseCaseResult;
}
