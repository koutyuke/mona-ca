import type { AccountAssociationSessionId, UserId } from "../../../../common/domain/value-objects";
import type { AccountAssociationSession } from "../../../../domain/entities";

export interface IAccountAssociationSessionRepository {
	findById(id: AccountAssociationSessionId): Promise<AccountAssociationSession | null>;

	save(session: AccountAssociationSession): Promise<void>;

	deleteById(id: AccountAssociationSessionId): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredSessions(): Promise<void>;
}
