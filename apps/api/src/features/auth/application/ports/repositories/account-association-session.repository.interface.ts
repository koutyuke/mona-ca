import type { UserId } from "../../../../../core/domain/value-objects";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { AccountAssociationSessionId } from "../../../domain/value-objects/ids";

export interface IAccountAssociationSessionRepository {
	findById(id: AccountAssociationSessionId): Promise<AccountAssociationSession | null>;

	save(session: AccountAssociationSession): Promise<void>;

	deleteById(id: AccountAssociationSessionId): Promise<void>;

	deleteByUserId(userId: UserId): Promise<void>;

	deleteExpiredSessions(): Promise<void>;
}
