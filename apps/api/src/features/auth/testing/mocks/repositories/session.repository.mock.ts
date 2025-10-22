import type { UserId } from "../../../../../core/domain/value-objects";
import type { ISessionRepository } from "../../../application/ports/repositories/session.repository.interface";
import type { Session } from "../../../domain/entities/session";
import type { SessionId } from "../../../domain/value-objects/ids";

export class SessionRepositoryMock implements ISessionRepository {
	private readonly sessionMap: Map<SessionId, Session>;

	constructor(maps: {
		sessionMap: Map<SessionId, Session>;
	}) {
		this.sessionMap = maps.sessionMap;
	}

	async findById(id: SessionId): Promise<Session | null> {
		return this.sessionMap.get(id) || null;
	}

	async findManyByUserId(userId: UserId): Promise<Session[]> {
		return Array.from(this.sessionMap.values()).filter(session => session.userId === userId);
	}

	async save(session: Session): Promise<void> {
		this.sessionMap.set(session.id, session);
	}

	async deleteById(id: SessionId): Promise<void> {
		this.sessionMap.delete(id);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [sessionId, session] of this.sessionMap.entries()) {
			if (session.userId === userId) {
				this.sessionMap.delete(sessionId);
			}
		}
	}

	async deleteExpiredSessions(): Promise<void> {
		const now = new Date();
		for (const [sessionId, session] of this.sessionMap.entries()) {
			if (session.expiresAt <= now) {
				this.sessionMap.delete(sessionId);
			}
		}
	}
}
