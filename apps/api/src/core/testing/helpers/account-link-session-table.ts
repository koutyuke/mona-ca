export type RawAccountLinkSession = {
	id: string;
	user_id: string;
	secret_hash: Array<number>;
	expires_at: number;
};

export class AccountLinkSessionTableHelper {
	constructor(private readonly db: D1Database) {}

	public async save(raw: RawAccountLinkSession): Promise<void> {
		await this.db
			.prepare("INSERT INTO account_link_sessions (id, user_id, secret_hash, expires_at) VALUES (?1, ?2, ?3, ?4)")
			.bind(raw.id, raw.user_id, raw.secret_hash, raw.expires_at)
			.run();
	}

	public async findById(id: string): Promise<RawAccountLinkSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_link_sessions WHERE id = ?1")
			.bind(id)
			.all<RawAccountLinkSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawAccountLinkSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_link_sessions WHERE user_id = ?1")
			.bind(userId)
			.all<RawAccountLinkSession>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM account_link_sessions").run();
	}
}
