import type { Ok, Result } from "@mona-ca/core/utils";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { AccountAssociationSessionToken } from "../../../domain/value-objects/session-token";

type Success = Ok<{
	accountAssociationSessionToken: AccountAssociationSessionToken;
	accountAssociationSession: AccountAssociationSession;
}>;

export type AccountAssociationChallengeUseCaseResult = Result<Success>;

export interface IAccountAssociationChallengeUseCase {
	execute(oldAccountAssociationSession: AccountAssociationSession): Promise<AccountAssociationChallengeUseCaseResult>;
}
