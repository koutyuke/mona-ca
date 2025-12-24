import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newSessionId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { ISessionRepository } from "../../../application/ports/out/repositories/session.repository.interface";
import type { Session } from "../../../domain/entities/session";
import type { SessionId } from "../../../domain/value-objects/ids";

interface FoundSessionDto {
	id: string;
	userId: string;
	secretHash: Buffer;
	expiresAt: Date;
}

export class SessionRepository implements ISessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(sessionId: SessionId): Promise<Session | null> {
		const sessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.sessionsTable)
			.where(eq(this.drizzleService.schema.sessionsTable.id, sessionId));

		if (sessions.length > 1) {
			throw new Error("Multiple sessions found for the same session id");
		}

		return sessions.length === 1 ? this.convertToSession(sessions[0]!) : null;
	}

	public async findManyByUserId(userId: UserId): Promise<Session[]> {
		const sessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.sessionsTable)
			.where(eq(this.drizzleService.schema.sessionsTable.userId, userId));

		return sessions.map(session => this.convertToSession(session));
	}

	public async save(session: Session): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.sessionsTable)
			.values({
				id: session.id,
				userId: session.userId,
				secretHash: Buffer.from(session.secretHash),
				expiresAt: session.expiresAt,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.sessionsTable.id,
				set: {
					expiresAt: session.expiresAt,
				},
			});
	}

	public async deleteById(sessionId: SessionId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessionsTable)
			.where(eq(this.drizzleService.schema.sessionsTable.id, sessionId))
			.execute();
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessionsTable)
			.where(lte(this.drizzleService.schema.sessionsTable.expiresAt, new Date()))
			.execute();
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessionsTable)
			.where(eq(this.drizzleService.schema.sessionsTable.userId, userId))
			.execute();
	}

	private convertToSession(dto: FoundSessionDto): Session {
		return {
			id: newSessionId(dto.id),
			userId: newUserId(dto.userId),
			secretHash: new Uint8Array(dto.secretHash),
			expiresAt: dto.expiresAt,
		} satisfies Session;
	}
}
