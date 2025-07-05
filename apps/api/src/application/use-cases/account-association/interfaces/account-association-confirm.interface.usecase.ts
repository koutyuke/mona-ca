import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession, Session } from "../../../../domain/entities";

type Success = {
	sessionToken: string;
	session: Session;
};

type Error =
	| Err<"INVALID_ASSOCIATION_CODE">
	| Err<"OAUTH_PROVIDER_ALREADY_LINKED">
	| Err<"OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER">;

export type AccountAssociationConfirmUseCaseResult = Result<Success, Error>;

export interface IAccountAssociationConfirmUseCase {
	execute(
		code: string,
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationConfirmUseCaseResult>;
}
