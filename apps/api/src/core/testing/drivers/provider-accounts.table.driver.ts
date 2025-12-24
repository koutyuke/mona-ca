export type RawProviderAccount = {
	provider: "google" | "discord";
	provider_user_id: string;
	user_id: string;
	linked_at: number;
};

export class ProviderAccountsTableDriver {
	constructor(private readonly db: D1Database) {}

	public async save(raw: RawProviderAccount): Promise<void> {
		await this.db
			.prepare("INSERT INTO provider_accounts (provider, provider_user_id, user_id, linked_at) VALUES (?1, ?2, ?3, ?4)")
			.bind(raw.provider, raw.provider_user_id, raw.user_id, raw.linked_at)
			.run();
	}

	public async findByProviderAndProviderUserId(
		provider: string,
		providerUserId: string,
	): Promise<RawProviderAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM provider_accounts WHERE provider = ?1 AND provider_user_id = ?2")
			.bind(provider, providerUserId)
			.all<RawProviderAccount>();

		return results;
	}

	public async findByUserIdAndProvider(userId: string, provider: string): Promise<RawProviderAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM provider_accounts WHERE user_id = ?1 AND provider = ?2")
			.bind(userId, provider)
			.all<RawProviderAccount>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM provider_accounts").run();
	}
}
