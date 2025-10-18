import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { ClientType } from "../../../../../shared/domain/value-objects";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { Session } from "../../../domain/entities/session";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";
import type { AccountAssociationSessionToken, SessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
	redirectURL: URL;
	clientType: ClientType;
}>;

type Error =
	| Err<"INVALID_STATE">
	| Err<"INVALID_REDIRECT_URI">
	| Err<"PROVIDER_ACCESS_DENIED", { redirectURL: URL }>
	| Err<"PROVIDER_ERROR", { redirectURL: URL }>
	| Err<"TOKEN_EXCHANGE_FAILED">
	| Err<"GET_IDENTITY_FAILED", { redirectURL: URL }>
	| Err<"ACCOUNT_ALREADY_REGISTERED", { redirectURL: URL }>
	| Err<
			"ACCOUNT_ASSOCIATION_AVAILABLE",
			{
				redirectURL: URL;
				clientType: ClientType;
				accountAssociationSessionToken: AccountAssociationSessionToken;
				accountAssociationSession: AccountAssociationSession;
			}
	  >;

export type ExternalAuthSignupCallbackUseCaseResult = Result<Success, Error>;

export interface IExternalAuthSignupCallbackUseCase {
	execute(
		production: boolean,
		error: string | undefined,
		redirectURI: string,
		provider: ExternalIdentityProvider,
		signedState: string,
		code: string | undefined,
		codeVerifier: string,
	): Promise<ExternalAuthSignupCallbackUseCaseResult>;
}
