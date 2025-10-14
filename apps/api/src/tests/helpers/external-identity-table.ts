import type { ToPrimitive } from "@mona-ca/core/utils";
import type { ExternalIdentity } from "../../domain/entities";
import type { ExternalIdentityProvider } from "../../domain/value-object";
import { toRawDate } from "./utils";

export type RawExternalIdentity = {
	provider: ToPrimitive<ExternalIdentityProvider>;
	provider_user_id: string;
	user_id: string;
	linked_at: number;
};

export class ExternalIdentityTableHelper {
	constructor(private readonly db: D1Database) {}

	public convertToRaw(externalIdentity: ExternalIdentity): RawExternalIdentity {
		return {
			provider: externalIdentity.provider,
			provider_user_id: externalIdentity.providerUserId,
			user_id: externalIdentity.userId,
			linked_at: toRawDate(externalIdentity.linkedAt),
		};
	}

	public async save(externalIdentity: ExternalIdentity): Promise<void> {
		const raw = this.convertToRaw(externalIdentity);
		await this.db
			.prepare(
				"INSERT INTO external_identities (provider, provider_user_id, user_id, linked_at) VALUES (?1, ?2, ?3, ?4)",
			)
			.bind(raw.provider, raw.provider_user_id, raw.user_id, raw.linked_at)
			.run();
	}

	public async findByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerUserId: string,
	): Promise<RawExternalIdentity[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM external_identities WHERE provider = ?1 AND provider_user_id = ?2")
			.bind(provider, providerUserId)
			.all<RawExternalIdentity>();

		return results;
	}

	public async findByUserIdAndProvider(
		userId: string,
		provider: ExternalIdentityProvider,
	): Promise<RawExternalIdentity[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM external_identities WHERE user_id = ?1 AND provider = ?2")
			.bind(userId, provider)
			.all<RawExternalIdentity>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM external_identities").run();
	}
}
