import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession, User } from "../../../../domain/entities";

type Success = {
	accountAssociationSession: AccountAssociationSession;
	user: User;
};

type Error = Err<"INVALID_ACCOUNT_ASSOCIATION_SESSION"> | Err<"EXPIRED_ACCOUNT_ASSOCIATION_SESSION">;

export type ValidateAccountAssociationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateAccountAssociationSessionUseCase {
	execute(accountAssociationSessionToken: string): Promise<ValidateAccountAssociationSessionUseCaseResult>;
}
