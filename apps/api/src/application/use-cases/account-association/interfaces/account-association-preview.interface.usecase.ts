import type { Err, Result } from "../../../../common/utils";
import type { User } from "../../../../domain/entities";
import type { OAuthProvider, OAuthProviderId } from "../../../../domain/value-object";

export type AccountAssociationPreviewUseCaseSuccessResult = {
	user: User;
	provider: OAuthProvider;
	providerId: OAuthProviderId;
};

export type AccountAssociationPreviewUseCaseErrorResult =
	| Err<"INVALID_STATE">
	| Err<"EXPIRED_STATE">
	| Err<"USER_NOT_FOUND">;

export type AccountAssociationPreviewUseCaseResult = Result<
	AccountAssociationPreviewUseCaseSuccessResult,
	AccountAssociationPreviewUseCaseErrorResult
>;

export interface IAccountAssociationPreviewUseCase {
	execute(state: string): Promise<AccountAssociationPreviewUseCaseResult>;
}
