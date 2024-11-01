export type DatabaseOAuthAccount = {
	provider: "discord";
	provider_id: string;
	user_id: string;
	created_at: number;
	updated_at: number;
};

export class OAuthAccountTableHelper {
	public baseOAuthAccount = {
		provider: "discord",
		providerId: "providerId",
		userId: "userId",
		createdAt: new Date(1704067200 * 1000),
		updatedAt: new Date(1704067200 * 1000),
	} as const;

	public baseDatabaseOAuthAccount = {
		provider: "discord",
		provider_id: "providerId",
		user_id: "userId",
		created_at: 1704067200,
		updated_at: 1704067200,
	} as const satisfies DatabaseOAuthAccount;

	constructor(private readonly db: D1Database) {}

	public async create(oAuthAccount?: DatabaseOAuthAccount): Promise<void> {
		const { provider, provider_id, user_id, created_at, updated_at } = oAuthAccount ?? this.baseDatabaseOAuthAccount;
		await this.db
			.prepare(
				"INSERT INTO oauth_accounts (provider, provider_id, user_id, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
			)
			.bind(provider, provider_id, user_id, created_at, updated_at)
			.run();
	}

	public async find(providerId: string): Promise<DatabaseOAuthAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM oauth_accounts WHERE provider_id = ?1")
			.bind(providerId)
			.all<DatabaseOAuthAccount>();

		return results;
	}

	public async findByUserId(userId: string): Promise<DatabaseOAuthAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM oauth_accounts WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseOAuthAccount>();

		return results;
	}
}
