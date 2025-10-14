import type { AccountAssociationSession, User } from "../../../../domain/entities";
import type { AccountAssociationSessionToken } from "../../../../domain/value-objects";

export type AccountAssociationChallengeUseCaseResult = {
	accountAssociationSessionToken: AccountAssociationSessionToken;
	accountAssociationSession: AccountAssociationSession;
};

export interface IAccountAssociationChallengeUseCase {
	execute(
		user: User,
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationChallengeUseCaseResult>;
}
