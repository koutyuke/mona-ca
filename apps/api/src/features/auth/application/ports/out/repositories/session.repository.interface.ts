import type { UserId } from "../../../../../../core/domain/value-objects";
import type { Session } from "../../../../domain/entities/session";
import type { SessionId } from "../../../../domain/value-objects/ids";

export interface ISessionRepository {
	findById(id: SessionId): Promise<Session | null>;

	findManyByUserId: (userId: UserId) => Promise<Session[]>;

	save: (session: Session) => Promise<void>;

	deleteById: (id: SessionId) => Promise<void>;

	deleteByUserId: (userId: UserId) => Promise<void>;

	deleteExpiredSessions: () => Promise<void>;
}
