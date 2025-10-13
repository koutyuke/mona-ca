import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession, Session } from "../../../../domain/entities";
import type { SessionToken } from "../../../../domain/value-object";

type Success = {
	sessionToken: SessionToken;
	session: Session;
};

type Error =
	| Err<"INVALID_ASSOCIATION_CODE">
	| Err<"ACCOUNT_ALREADY_LINKED">
	| Err<"ACCOUNT_LINKED_ELSEWHERE">
	| Err<"USER_NOT_FOUND">;

export type AccountAssociationConfirmUseCaseResult = Result<Success, Error>;

export interface IAccountAssociationConfirmUseCase {
	execute(
		code: string,
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationConfirmUseCaseResult>;
}
