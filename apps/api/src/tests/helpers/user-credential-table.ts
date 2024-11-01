export type DatabaseUserCredential = {
	user_id: string;
	password_hash: string | null;
	created_at: number;
	updated_at: number;
};

export class UserCredentialTableHelper {
	public baseUserCredential = {
		userId: "userId",
		passwordHash: "passwordHash",
		createdAt: new Date(1704067200 * 1000),
		updatedAt: new Date(1704067200 * 1000),
	} as const;

	public baseDatabaseUserCredential = {
		user_id: "userId",
		password_hash: "passwordHash",
		created_at: 1704067200,
		updated_at: 1704067200,
	} as const satisfies DatabaseUserCredential;

	constructor(private readonly db: D1Database) {}

	public async create(userCredential?: DatabaseUserCredential): Promise<void> {
		const { user_id, password_hash, created_at, updated_at } = userCredential ?? this.baseDatabaseUserCredential;
		await this.db
			.prepare("INSERT INTO user_credentials (user_id, password_hash, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)")
			.bind(user_id, password_hash, created_at, updated_at)
			.run();
	}

	public async find(userId: string): Promise<DatabaseUserCredential[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM user_credentials WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseUserCredential>();

		return results;
	}
}
