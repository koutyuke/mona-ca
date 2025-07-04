import type { Result } from "../../../../common/utils";
import type { AccountAssociationSession, User } from "../../../../domain/entities";

type Success = {
	accountAssociationSessionToken: string;
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
