import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession, User } from "../../../../domain/entities";

type Success = {
	accountAssociationSession: AccountAssociationSession;
	user: User;
};

type Error =
	| Err<"INVALID_TOKEN">
	| Err<"EXPIRED_CODE">
	| Err<"USER_NOT_FOUND">
	| Err<"INVALID_EMAIL">
	| Err<"EMAIL_NOT_VERIFIED">;

export type ValidateAccountAssociationSessionUseCaseResult = Result<Success, Error>;

export interface IValidateAccountAssociationSessionUseCase {
	execute(accountAssociationSessionToken: string): Promise<ValidateAccountAssociationSessionUseCaseResult>;
}
