import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ClientType, UserId } from "../../../../../../common/domain/value-objects";

type Success = Ok<{
	state: string;
	codeVerifier: string;
	redirectToClientURL: URL;
	redirectToProviderURL: URL;
}>;

type Error = Err<"INVALID_REDIRECT_URI">;

export type AccountLinkRequestUseCaseResult = Result<Success, Error>;

export interface IAccountLinkRequestUseCase {
	execute(
		production: boolean,
		clientType: ClientType,
		queryRedirectURI: string,
		userId: UserId,
	): AccountLinkRequestUseCaseResult;
}
