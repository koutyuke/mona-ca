import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { AccountAssociationSessionToken } from "../../../domain/value-objects/session-token";

export type AccountAssociationChallengeUseCaseResult = {
	accountAssociationSessionToken: AccountAssociationSessionToken;
	accountAssociationSession: AccountAssociationSession;
};

export interface IAccountAssociationChallengeUseCase {
	execute(oldAccountAssociationSession: AccountAssociationSession): Promise<AccountAssociationChallengeUseCaseResult>;
}
