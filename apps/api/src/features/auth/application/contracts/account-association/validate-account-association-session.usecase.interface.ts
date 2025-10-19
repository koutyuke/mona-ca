import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { AccountAssociationSessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	accountAssociationSession: AccountAssociationSession;
	userIdentity: UserIdentity;
}>;

type Error = Err<"ACCOUNT_ASSOCIATION_SESSION_INVALID"> | Err<"ACCOUNT_ASSOCIATION_SESSION_EXPIRED">;

export type ValidateAccountAssociationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateAccountAssociationSessionUseCase {
	execute(
		accountAssociationSessionToken: AccountAssociationSessionToken,
	): Promise<ValidateAccountAssociationSessionUseCaseResult>;
}
