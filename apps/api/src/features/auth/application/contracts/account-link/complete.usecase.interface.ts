import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_ASSOCIATION_CODE"> | Err<"ACCOUNT_ALREADY_LINKED"> | Err<"ACCOUNT_LINKED_ELSEWHERE">;

export type AccountLinkCompleteUseCaseResult = Result<Success, Error>;

export interface IAccountLinkCompleteUseCase {
	execute(
		code: string,
		userIdentity: UserCredentials,
		accountLinkSession: AccountLinkSession,
	): Promise<AccountLinkCompleteUseCaseResult>;
}
