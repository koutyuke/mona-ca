import type { SessionId, UserId } from "../../../../common/domain/value-objects";
import type { Session } from "../../../../domain/entities";

export interface ISessionRepository {
	findById(id: SessionId): Promise<Session | null>;

	findManyByUserId: (userId: UserId) => Promise<Session[]>;

	save: (session: Session) => Promise<void>;

	deleteById: (id: SessionId) => Promise<void>;

	deleteByUserId: (userId: UserId) => Promise<void>;

	deleteExpiredSessions: () => Promise<void>;
}
