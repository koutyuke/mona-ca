import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { Session } from "../../../domain/entities/session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { SessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	session: Session;
	sessionToken: SessionToken;
}>;

type Error = Err<"INVALID_ASSOCIATION_CODE"> | Err<"ACCOUNT_ALREADY_LINKED"> | Err<"ACCOUNT_LINKED_ELSEWHERE">;

export type AccountAssociationConfirmUseCaseResult = Result<Success, Error>;

export interface IAccountAssociationConfirmUseCase {
	execute(
		code: string,
		userIdentity: UserIdentity,
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationConfirmUseCaseResult>;
}
