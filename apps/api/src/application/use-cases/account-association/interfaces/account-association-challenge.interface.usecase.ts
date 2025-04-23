import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession } from "../../../../domain/entities";
import type { UserId } from "../../../../domain/value-object";

export type AccountAssociationChallengeUseCaseSuccessResult = {
	accountAssociationSessionToken: string;
	accountAssociationSession: AccountAssociationSession;
};

export type AccountAssociationChallengeUseCaseErrorResult =
	| Err<"INVALID_STATE_OR_SESSION_TOKEN">
	| Err<"EXPIRED_STATE_OR_SESSION_TOKEN">
	| Err<"USER_NOT_FOUND">;

export type AccountAssociationChallengeUseCaseResult = Result<
	AccountAssociationChallengeUseCaseSuccessResult,
	AccountAssociationChallengeUseCaseErrorResult
>;

export interface IAccountAssociationChallengeUseCase {
	execute(
		stateOrSessionToken: string,
		userRateLimit: (userId: UserId) => Promise<void>,
	): Promise<AccountAssociationChallengeUseCaseResult>;
}
