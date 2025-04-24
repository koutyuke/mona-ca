import type { Err, Result } from "../../../../common/utils";
import type { Session } from "../../../../domain/entities";

export type AccountAssociationConfirmUseCaseSuccessResult = {
	sessionToken: string;
	session: Session;
};

export type AccountAssociationConfirmUseCaseErrorResult =
	| Err<"INVALID_TOKEN">
	| Err<"EXPIRED_TOKEN">
	| Err<"INVALID_CODE">
	| Err<"PROVIDER_ALREADY_LINKED">
	| Err<"ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER">;

export type AccountAssociationConfirmUseCaseResult = Result<
	AccountAssociationConfirmUseCaseSuccessResult,
	AccountAssociationConfirmUseCaseErrorResult
>;

export interface IAccountAssociationConfirmUseCase {
	execute(accountAssociationSessionToken: string, code: string): Promise<AccountAssociationConfirmUseCaseResult>;
}
