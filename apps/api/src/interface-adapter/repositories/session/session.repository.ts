import { Session } from "@/domain/session";
import { User } from "@/domain/user";
import type { DrizzleService } from "@/infrastructure/drizzle";
import { eq, lte } from "drizzle-orm";
import type { ISessionRepository, SessionConstructor } from "./interfaces/session.repository.interface";

export class SessionRepository implements ISessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findUserSessions(userId: string): Promise<Session[]> {
		const sessions = await this.drizzleService.db.query.session.findMany({
			where: (session, { eq }) => eq(session.userId, userId),
		});
		return sessions.map(session => new Session(session));
	}

	public async findSessionAndUser(sessionId: string): Promise<{ session: Session | null; user: User | null }> {
		const [databaseSession, databaseUser] = await Promise.all([
			this.getSession(sessionId),
			this.getUserFromSessionId(sessionId),
		]);
		return {
			session: databaseSession ? new Session(databaseSession) : null,
			user: databaseUser ? new User(databaseUser) : null,
		};
	}

	public async createSession(session: Omit<SessionConstructor, "fresh">): Promise<void> {
		await this.drizzleService.db.insert(this.drizzleService.schema.session).values(session).run();
	}

	public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
		await this.drizzleService.db
			.update(this.drizzleService.schema.session)
			.set({
				expiresAt,
			})
			.where(eq(this.drizzleService.schema.session.id, sessionId))
			.execute();
	}

	public async deleteSession(sessionId: string): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.session)
			.where(eq(this.drizzleService.schema.session.id, sessionId))
			.execute();
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.session)
			.where(lte(this.drizzleService.schema.session.expiresAt, new Date()))
			.execute();
	}

	public async deleteUserSessions(userId: string): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.session)
			.where(eq(this.drizzleService.schema.session.userId, userId))
			.execute();
	}

	private async getUserFromSessionId(sessionId: string): Promise<User | null> {
		const result = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.innerJoin(
				this.drizzleService.schema.session,
				eq(this.drizzleService.schema.session.userId, this.drizzleService.schema.users.id),
			)
			.where(eq(this.drizzleService.schema.session.id, sessionId));

		return result.length === 1 ? new User(result[0]!.users) : null;
	}

	private async getSession(sessionId: string): Promise<Session | null> {
		const session = await this.drizzleService.db.query.session.findFirst({
			where: (session, { eq }) => eq(session.id, sessionId),
		});
		return session ? new Session(session) : null;
	}
}
