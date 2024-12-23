import { eq, lte } from "drizzle-orm";
import { Session } from "../../../entities/session";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { ISessionRepository, SessionConstructor } from "./interfaces/session.repository.interface";

export class SessionRepository implements ISessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async find(sessionId: string): Promise<Session | null> {
		const session = await this.drizzleService.db.query.sessions.findFirst({
			where: (session, { eq }) => eq(session.id, sessionId),
		});
		return session ? new Session(session) : null;
	}

	public async findManyByUserId(userId: string): Promise<Session[]> {
		const sessions = await this.drizzleService.db.query.sessions.findMany({
			where: (session, { eq }) => eq(session.userId, userId),
		});
		return sessions.map(session => new Session(session));
	}

	public async create(session: Omit<SessionConstructor, "fresh">): Promise<Session> {
		const results = await this.drizzleService.db
			.insert(this.drizzleService.schema.sessions)
			.values(session)
			.returning();
		if (results.length !== 1) {
			throw new Error("Failed to create session.");
		}
		return new Session(results[0]!);
	}

	public async updateExpiration(sessionId: string, expiresAt: Date): Promise<Session> {
		const results = await this.drizzleService.db
			.update(this.drizzleService.schema.sessions)
			.set({
				expiresAt,
			})
			.where(eq(this.drizzleService.schema.sessions.id, sessionId))
			.returning();

		if (results.length !== 1) {
			throw new Error("Failed to update session expiration.");
		}
		return new Session(results[0]!);
	}

	public async delete(sessionId: string): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessions)
			.where(eq(this.drizzleService.schema.sessions.id, sessionId))
			.execute();
	}

	public async deleteManyByExpired(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessions)
			.where(lte(this.drizzleService.schema.sessions.expiresAt, new Date()))
			.execute();
	}

	public async deleteManyByUserId(userId: string): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.sessions)
			.where(eq(this.drizzleService.schema.sessions.userId, userId))
			.execute();
	}
}
