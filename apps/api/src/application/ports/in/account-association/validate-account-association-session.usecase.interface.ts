import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession, User } from "../../../../domain/entities";
import type { AccountAssociationSessionToken } from "../../../../domain/value-object";

type Success = {
	accountAssociationSession: AccountAssociationSession;
	user: User;
};

type Error = Err<"ACCOUNT_ASSOCIATION_SESSION_INVALID"> | Err<"ACCOUNT_ASSOCIATION_SESSION_EXPIRED">;

export type ValidateAccountAssociationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateAccountAssociationSessionUseCase {
	execute(
		accountAssociationSessionToken: AccountAssociationSessionToken,
	): Promise<ValidateAccountAssociationSessionUseCaseResult>;
}
