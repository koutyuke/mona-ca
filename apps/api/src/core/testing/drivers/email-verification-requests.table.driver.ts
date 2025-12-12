export type RawEmailVerificationRequest = {
	id: string;
	email: string;
	user_id: string;
	code: string;
	secret_hash: Array<number>;
	expires_at: number;
};

export class EmailVerificationRequestsTableDriver {
	constructor(private readonly db: D1Database) {}

	public async save(raw: RawEmailVerificationRequest): Promise<void> {
		await this.db
			.prepare(
				"INSERT INTO email_verification_requests (id, email, user_id, code, secret_hash, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
			)
			.bind(raw.id, raw.email, raw.user_id, raw.code, raw.secret_hash, raw.expires_at)
			.run();
	}

	public async findById(id: string): Promise<RawEmailVerificationRequest[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verification_requests WHERE id = ?1")
			.bind(id)
			.all<RawEmailVerificationRequest>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawEmailVerificationRequest[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verification_requests WHERE user_id = ?1")
			.bind(userId)
			.all<RawEmailVerificationRequest>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM email_verification_requests").run();
	}
}
