import type { AccountAssociationSessionToken } from "../../../../../../common/domain/value-objects";
import type { AccountAssociationSession, User } from "../../../../domain/entities";

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
