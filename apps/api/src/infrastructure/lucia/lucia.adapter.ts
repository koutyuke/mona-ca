import type { DrizzleService } from "@/infrastructure/drizzle";
import { eq, lte } from "drizzle-orm";
import type { DatabaseSession, DatabaseUser } from "lucia";
import type { ILuciaAdapter } from "./interface/lucia.adapter.interface";
import type { FlatDatabaseSession, FlatDatabaseUser } from "./lucia.type";

export class LuciaAdapter implements ILuciaAdapter {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async getUserSessions(userId: string): Promise<DatabaseSession[]> {
		const sessions = await this.drizzleService.db.query.session.findMany({
			where: (session, { eq }) => eq(session.userId, userId),
		});
		return sessions.map(this.transformIntoDatabaseSession);
	}

	public async getSessionAndUser(
		sessionId: string,
	): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
		const [databaseSession, databaseUser] = await Promise.all([
			this.getSession(sessionId),
			this.getUserFromSessionId(sessionId),
		]);
		return [databaseSession, databaseUser];
	}

	public async setSession(session: DatabaseSession): Promise<void> {
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
		this.drizzleService.db
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

	private async getUserFromSessionId(sessionId: string): Promise<DatabaseUser | null> {
		const result = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.users)
			.innerJoin(
				this.drizzleService.schema.session,
				eq(this.drizzleService.schema.session.userId, this.drizzleService.schema.users.id),
			)
			.where(eq(this.drizzleService.schema.session.id, sessionId));

		return result.length === 1 ? this.transformIntoDatabaseUser(result[0]!.users) : null;
	}

	private async getSession(sessionId: string): Promise<DatabaseSession | null> {
		const session = await this.drizzleService.db.query.session.findFirst({
			where: (session, { eq }) => eq(session.id, sessionId),
		});
		return session ? this.transformIntoDatabaseSession(session) : null;
	}

	private transformIntoDatabaseSession(session: FlatDatabaseSession): DatabaseSession {
		const { id, expiresAt: expiredAt, userId, ...attributes } = session;
		return {
			id,
			userId,
			expiresAt: expiredAt,
			attributes,
		};
	}

	private transformIntoDatabaseUser(user: FlatDatabaseUser): DatabaseUser {
		const { id, ...attributes } = user;
		return {
			id,
			attributes,
		};
	}
}
