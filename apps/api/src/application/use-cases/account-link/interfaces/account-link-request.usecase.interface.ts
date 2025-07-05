import type { Err, Result } from "../../../../common/utils";
import type { ClientType, UserId } from "../../../../domain/value-object";

type Success = {
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
};

type Error = Err<"INVALID_REDIRECT_URL">;

export type AccountLinkRequestUseCaseResult = Result<Success, Error>;

export interface IAccountLinkRequestUseCase {
	execute(clientType: ClientType, queryRedirectURI: string, userId: UserId): AccountLinkRequestUseCaseResult;
}
