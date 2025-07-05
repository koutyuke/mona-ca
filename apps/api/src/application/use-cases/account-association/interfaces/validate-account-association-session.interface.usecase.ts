import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession, User } from "../../../../domain/entities";

type Success = {
	accountAssociationSession: AccountAssociationSession;
	user: User;
};

type Error = Err<"ACCOUNT_ASSOCIATION_SESSION_INVALID"> | Err<"ACCOUNT_ASSOCIATION_SESSION_EXPIRED">;

export type ValidateAccountAssociationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateAccountAssociationSessionUseCase {
	execute(accountAssociationSessionToken: string): Promise<ValidateAccountAssociationSessionUseCaseResult>;
}
