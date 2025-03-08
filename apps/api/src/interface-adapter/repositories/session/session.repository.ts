import { eq, lte } from "drizzle-orm";
import { Session } from "../../../domain/entities";
import { type SessionId, type UserId, newSessionId, newUserId } from "../../../domain/value-object";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { ISessionRepository } from "./interfaces/session.repository.interface";

interface FoundSessionDto {
	id: string;
	userId: string;
	expiresAt: Date;
}

export class SessionRepository implements ISessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(sessionId: SessionId): Promise<Session | null> {
		const sessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.sessions)
			.where(eq(this.drizzleService.schema.sessions.id, sessionId));

		if (sessions.length > 1) {
			throw new Error("Multiple sessions found for the same session id");
		}

		return sessions.length === 1 ? this.convertToSession(sessions[0]!) : null;
	}

	public async findManyByUserId(userId: UserId): Promise<Session[]> {
		const sessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.sessions)
			.where(eq(this.drizzleService.schema.sessions.userId, userId));

		return sessions.map(session => this.convertToSession(session));
	}

	public async save(session: Session): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.sessions)
			.values(session)
			.onConflictDoUpdate({
				target: this.drizzleService.schema.sessions.id,
				set: {
					expiresAt: session.expiresAt,
				},
			});
	}

	public async delete(sessionId: SessionId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessions)
			.where(eq(this.drizzleService.schema.sessions.id, sessionId))
			.execute();
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessions)
			.where(lte(this.drizzleService.schema.sessions.expiresAt, new Date()))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessions)
			.where(eq(this.drizzleService.schema.sessions.userId, userId))
			.execute();
	}

	private convertToSession(dto: FoundSessionDto): Session {
		return new Session({
			id: newSessionId(dto.id),
			userId: newUserId(dto.userId),
			expiresAt: dto.expiresAt,
		});
	}
}
