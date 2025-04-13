import type { OAuthAccount } from "../../domain/entities";
import { newOAuthProvider, newOAuthProviderId, newUserId } from "../../domain/value-object";

export type DatabaseOAuthAccount = {
	provider: "discord";
	provider_id: string;
	user_id: string;
	created_at: number;
	updated_at: number;
};

export class OAuthAccountTableHelper {
	public baseOAuthAccount = {
		provider: newOAuthProvider("discord"),
		providerId: newOAuthProviderId("providerId"),
		userId: newUserId("userId"),
		createdAt: new Date(1704067200 * 1000),
		updatedAt: new Date(1704067200 * 1000),
	} satisfies OAuthAccount;

	public baseDatabaseOAuthAccount = {
		provider: "discord",
		provider_id: "providerId",
		user_id: "userId",
		created_at: 1704067200,
		updated_at: 1704067200,
	} as const satisfies DatabaseOAuthAccount;

	constructor(private readonly db: D1Database) {}

	public async create(oauthAccount?: DatabaseOAuthAccount): Promise<void> {
		const { provider, provider_id, user_id, created_at, updated_at } = oauthAccount ?? this.baseDatabaseOAuthAccount;
		await this.db
			.prepare(
				"INSERT INTO oauth_accounts (provider, provider_id, user_id, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
			)
			.bind(provider, provider_id, user_id, created_at, updated_at)
			.run();
	}

	public async findByProviderAndProviderId(provider: "discord", providerId: string): Promise<DatabaseOAuthAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM oauth_accounts WHERE provider = ?1 AND provider_id = ?2")
			.bind(provider, providerId)
			.all<DatabaseOAuthAccount>();

		return results;
	}

	public async findByUserIdAndProvider(userId: string, provider: "discord"): Promise<DatabaseOAuthAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM oauth_accounts WHERE user_id = ?1 AND provider = ?2")
			.bind(userId, provider)
			.all<DatabaseOAuthAccount>();

		return results;
	}
}
