import type { Err, Result } from "../../../../common/utils";
import type { AccountAssociationSession } from "../../../../domain/entities";

type Success = {
	accountAssociationSessionToken: string;
	accountAssociationSession: AccountAssociationSession;
};

type Error = Err<"EXPIRED_SESSION_TOKEN"> | Err<"USER_NOT_FOUND"> | Err<"EMAIL_NOT_VERIFIED"> | Err<"INVALID_EMAIL">;

export type AccountAssociationChallengeUseCaseResult = Result<Success, Error>;

export interface IAccountAssociationChallengeUseCase {
	execute(accountAssociationSession: AccountAssociationSession): Promise<AccountAssociationChallengeUseCaseResult>;
}
