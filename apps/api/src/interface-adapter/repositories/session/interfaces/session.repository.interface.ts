import type { Session } from "../../../../domain/entities";
import type { SessionId, UserId } from "../../../../domain/value-object";

export interface ISessionRepository {
	findById(id: SessionId): Promise<Session | null>;

	findManyByUserId: (userId: UserId) => Promise<Session[]>;

	save: (session: Session) => Promise<void>;

	delete: (id: SessionId) => Promise<void>;

	deleteByUserId: (userId: UserId) => Promise<void>;

	deleteExpiredSessions: () => Promise<void>;
}
