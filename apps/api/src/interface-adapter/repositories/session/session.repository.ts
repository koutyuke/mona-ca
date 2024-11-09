import { Session } from "@/domain/session";
import type { DrizzleService } from "@/infrastructure/drizzle";
import { eq, lte } from "drizzle-orm";
import type { ISessionRepository, SessionConstructor } from "./interfaces/session.repository.interface";

export class SessionRepository implements ISessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async find(sessionId: string): Promise<Session | null> {
		const session = await this.drizzleService.db.query.session.findFirst({
			where: (session, { eq }) => eq(session.id, sessionId),
		});
		return session ? new Session(session) : null;
	}

	public async findManyByUserId(userId: string): Promise<Session[]> {
		const sessions = await this.drizzleService.db.query.session.findMany({
			where: (session, { eq }) => eq(session.userId, userId),
		});
		return sessions.map(session => new Session(session));
	}

	public async create(session: Omit<SessionConstructor, "fresh">): Promise<Session> {
		const results = await this.drizzleService.db.insert(this.drizzleService.schema.session).values(session).returning();
		if (results.length !== 1) {
			throw new Error("Failed to create session.");
		}
		return new Session(results[0]!);
	}

	public async updateExpiration(sessionId: string, expiresAt: Date): Promise<Session> {
		const results = await this.drizzleService.db
			.update(this.drizzleService.schema.session)
			.set({
				expiresAt,
			})
			.where(eq(this.drizzleService.schema.session.id, sessionId))
			.returning();

		if (results.length !== 1) {
			throw new Error("Failed to update session expiration.");
		}
		return new Session(results[0]!);
	}

	public async delete(sessionId: string): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.session)
			.where(eq(this.drizzleService.schema.session.id, sessionId))
			.execute();
	}

	public async deleteManyByExpired(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.session)
			.where(lte(this.drizzleService.schema.session.expiresAt, new Date()))
			.execute();
	}

	public async deleteManyByUserId(userId: string): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.session)
			.where(eq(this.drizzleService.schema.session.userId, userId))
			.execute();
	}
}
