export type DatabaseSession = {
	id: string;
	user_id: string;
	expires_at: number;
};

export class SessionTableHelper {
	public baseSession = {
		id: "sessionId",
		userId: "userId",
		expiresAt: new Date(1704067200 * 1000),
	} as const;

	public baseDatabaseSession = {
		id: "sessionId",
		user_id: "userId",
		expires_at: 1704067200,
	} as const satisfies DatabaseSession;

	constructor(private readonly db: D1Database) {}

	public async create(session?: DatabaseSession): Promise<void> {
		const { id, user_id, expires_at } = session ?? this.baseDatabaseSession;

		await this.db
			.prepare("INSERT INTO session (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind(id, user_id, expires_at)
			.run();
	}

	public async find(id: string): Promise<DatabaseSession[]> {
		const { results } = await this.db.prepare("SELECT * FROM session WHERE id = ?1").bind(id).all<DatabaseSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<DatabaseSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM session WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseSession>();

		return results;
	}
}
