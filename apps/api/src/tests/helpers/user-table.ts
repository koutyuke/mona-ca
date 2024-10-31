export type DatabaseUser = {
	id: string;
	name: string;
	email: string;
	email_verified: 0 | 1;
	icon_url: string | null;
	gender: "man" | "woman";
	created_at: number;
	updated_at: number;
};

export class UserTableHelper {
	public baseUser = {
		id: "userId",
		name: "testUser",
		email: "test.email@example.com",
		emailVerified: true,
		iconUrl: "http://example.com/icon-url",
		gender: "man",
		createdAt: new Date(1704067200 * 1000),
		updatedAt: new Date(1704067200 * 1000),
	} as const;

	public baseDatabaseUser = {
		id: "userId",
		name: "testUser",
		email: "test.email@example.com",
		email_verified: 1,
		icon_url: "http://example.com/icon-url",
		gender: "man",
		created_at: 1704067200,
		updated_at: 1704067200,
	} as const satisfies DatabaseUser;

	constructor(private readonly db: D1Database) {}

	public async create(user?: DatabaseUser): Promise<void> {
		const { id, name, email, email_verified, icon_url, gender, created_at, updated_at } = user ?? this.baseDatabaseUser;

		await this.db
			.prepare(
				"INSERT INTO users (id, name, email, email_verified, icon_url, gender, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
			)
			.bind(id, name, email, email_verified, icon_url, gender, created_at, updated_at)
			.run();
	}

	public async find(id: string): Promise<DatabaseUser[]> {
		const { results } = await this.db.prepare("SELECT * FROM users WHERE id = ?1").bind(id).all<DatabaseUser>();

		return results;
	}
}
