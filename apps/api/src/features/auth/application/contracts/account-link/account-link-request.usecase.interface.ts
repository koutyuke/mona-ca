import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ClientType, UserId } from "../../../../../shared/domain/value-objects";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";

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
		provider: ExternalIdentityProvider,
		queryRedirectURI: string,
		userId: UserId,
	): AccountLinkRequestUseCaseResult;
}
