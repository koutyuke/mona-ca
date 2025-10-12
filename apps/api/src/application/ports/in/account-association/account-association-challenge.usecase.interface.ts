import type { Result } from "../../../../common/utils";
import type { AccountAssociationSession, User } from "../../../../domain/entities";
import type { AccountAssociationSessionToken } from "../../../../domain/value-object";

type Success = {
	accountAssociationSessionToken: AccountAssociationSessionToken;
	accountAssociationSession: AccountAssociationSession;
};

type Error = never;

export type AccountAssociationChallengeUseCaseResult = Result<Success, Error>;

export interface IAccountAssociationChallengeUseCase {
	execute(
		user: User,
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationChallengeUseCaseResult>;
}
