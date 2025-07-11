import type { ToPrimitive } from "../../common/utils";
import type { OAuthAccount } from "../../domain/entities";
import { type OAuthProvider, newOAuthProvider, newOAuthProviderId, newUserId } from "../../domain/value-object";

export type DatabaseOAuthAccount = {
	provider: ToPrimitive<OAuthProvider>;
	provider_id: string;
	user_id: string;
	linked_at: number;
};

export class OAuthAccountTableHelper {
	public baseData = {
		provider: newOAuthProvider("discord"),
		providerId: newOAuthProviderId("providerId"),
		userId: newUserId("userId"),
		linkedAt: new Date(1704067200 * 1000),
	} satisfies OAuthAccount;

	public baseDatabaseData = {
		provider: "discord",
		provider_id: "providerId",
		user_id: "userId",
		linked_at: 1704067200,
	} as const satisfies DatabaseOAuthAccount;

	constructor(private readonly db: D1Database) {}

	public async create(oauthAccount?: DatabaseOAuthAccount): Promise<void> {
		const { provider, provider_id, user_id, linked_at } = oauthAccount ?? this.baseDatabaseData;
		await this.db
			.prepare("INSERT INTO oauth_accounts (provider, provider_id, user_id, linked_at) VALUES (?1, ?2, ?3, ?4)")
			.bind(provider, provider_id, user_id, linked_at)
			.run();
	}

	public async findByProviderAndProviderId(
		provider: OAuthProvider,
		providerId: string,
	): Promise<DatabaseOAuthAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM oauth_accounts WHERE provider = ?1 AND provider_id = ?2")
			.bind(provider, providerId)
			.all<DatabaseOAuthAccount>();

		return results;
	}

	public async findByUserIdAndProvider(userId: string, provider: OAuthProvider): Promise<DatabaseOAuthAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM oauth_accounts WHERE user_id = ?1 AND provider = ?2")
			.bind(userId, provider)
			.all<DatabaseOAuthAccount>();

		return results;
	}
}
