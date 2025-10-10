import type { ToPrimitive } from "../../common/utils";
import type { AccountAssociationSession } from "../../domain/entities";
import type { OAuthProvider } from "../../domain/value-object";
import { toRawDate, toRawSessionSecretHash } from "./utils";

export type RawAccountAssociationSession = {
	id: string;
	user_id: string;
	code: string | null;
	secret_hash: Array<number>;
	email: string;
	provider: ToPrimitive<OAuthProvider>;
	provider_id: string;
	expires_at: number;
};

export class AccountAssociationSessionTableHelper {
	constructor(private readonly db: D1Database) {}

	public async save(session: AccountAssociationSession): Promise<void> {
		const raw = this.convertToRaw(session);

		await this.db
			.prepare(
				"INSERT INTO account_association_sessions (id, user_id, code, secret_hash, email, provider, provider_id, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
			)
			.bind(raw.id, raw.user_id, raw.code, raw.secret_hash, raw.email, raw.provider, raw.provider_id, raw.expires_at)
			.run();
	}

	public async findById(id: string): Promise<RawAccountAssociationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_association_sessions WHERE id = ?1")
			.bind(id)
			.all<RawAccountAssociationSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawAccountAssociationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_association_sessions WHERE user_id = ?1")
			.bind(userId)
			.all<RawAccountAssociationSession>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM account_association_sessions").run();
	}

	public convertToRaw(session: AccountAssociationSession): RawAccountAssociationSession {
		return {
			id: session.id,
			user_id: session.userId,
			code: session.code,
			secret_hash: toRawSessionSecretHash(session.secretHash),
			email: session.email,
			provider: session.provider,
			provider_id: session.providerId,
			expires_at: toRawDate(session.expiresAt),
		};
	}
}
