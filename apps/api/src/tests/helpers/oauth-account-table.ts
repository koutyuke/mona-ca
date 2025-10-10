import type { ToPrimitive } from "../../common/utils";
import type { OAuthAccount } from "../../domain/entities";
import { newOAuthProvider, newOAuthProviderId, newUserId } from "../../domain/value-object";
import type { OAuthProvider } from "../../domain/value-object";
import { toRawDate } from "./utils";

export type RawOAuthAccount = {
	provider: ToPrimitive<OAuthProvider>;
	provider_id: string;
	user_id: string;
	linked_at: number;
};

export class OAuthAccountTableHelper {
	constructor(private readonly db: D1Database) {}

	public createData(override?: {
		oauthAccount?: Partial<OAuthAccount>;
	}): { oauthAccount: OAuthAccount } {
		const oauthAccount: OAuthAccount = {
			provider: override?.oauthAccount?.provider ?? newOAuthProvider("discord"),
			providerId: override?.oauthAccount?.providerId ?? newOAuthProviderId("providerId"),
			userId: override?.oauthAccount?.userId ?? newUserId("userId"),
			linkedAt: override?.oauthAccount?.linkedAt ?? new Date(1704067200 * 1000),
		} satisfies OAuthAccount;

		return { oauthAccount };
	}

	public convertToRaw(oauthAccount: OAuthAccount): RawOAuthAccount {
		return {
			provider: oauthAccount.provider,
			provider_id: oauthAccount.providerId,
			user_id: oauthAccount.userId,
			linked_at: toRawDate(oauthAccount.linkedAt),
		};
	}

	public async save(oauthAccount: OAuthAccount): Promise<void> {
		const raw = this.convertToRaw(oauthAccount);
		await this.db
			.prepare("INSERT INTO oauth_accounts (provider, provider_id, user_id, linked_at) VALUES (?1, ?2, ?3, ?4)")
			.bind(raw.provider, raw.provider_id, raw.user_id, raw.linked_at)
			.run();
	}

	public async findByProviderAndProviderId(provider: OAuthProvider, providerId: string): Promise<RawOAuthAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM oauth_accounts WHERE provider = ?1 AND provider_id = ?2")
			.bind(provider, providerId)
			.all<RawOAuthAccount>();

		return results;
	}

	public async findByUserIdAndProvider(userId: string, provider: OAuthProvider): Promise<RawOAuthAccount[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM oauth_accounts WHERE user_id = ?1 AND provider = ?2")
			.bind(userId, provider)
			.all<RawOAuthAccount>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM oauth_accounts").run();
	}
}
