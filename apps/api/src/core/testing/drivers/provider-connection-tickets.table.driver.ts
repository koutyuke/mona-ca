export type RawProviderConnectionTicket = {
	id: string;
	user_id: string;
	secret_hash: Array<number>;
	expires_at: number;
};

export class ProviderConnectionTicketsTableDriver {
	constructor(private readonly db: D1Database) {}

	public async save(raw: RawProviderConnectionTicket): Promise<void> {
		await this.db
			.prepare("INSERT INTO provider_connection_tickets (id, user_id, secret_hash, expires_at) VALUES (?1, ?2, ?3, ?4)")
			.bind(raw.id, raw.user_id, raw.secret_hash, raw.expires_at)
			.run();
	}

	public async findById(id: string): Promise<RawProviderConnectionTicket[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM provider_connection_tickets WHERE id = ?1")
			.bind(id)
			.all<RawProviderConnectionTicket>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawProviderConnectionTicket[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM provider_connection_tickets WHERE user_id = ?1")
			.bind(userId)
			.all<RawProviderConnectionTicket>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM provider_connection_tickets").run();
	}
}
