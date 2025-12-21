export type RawAccountLinkProposal = {
	id: string;
	user_id: string;
	code: string | null;
	secret_hash: Array<number>;
	email: string;
	provider: "google" | "discord";
	provider_user_id: string;
	expires_at: number;
};

export class AccountLinkProposalsTableDriver {
	constructor(private readonly db: D1Database) {}

	public async save(raw: RawAccountLinkProposal): Promise<void> {
		await this.db
			.prepare(
				"INSERT INTO account_link_proposals (id, user_id, code, secret_hash, email, provider, provider_user_id, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
			)
			.bind(
				raw.id,
				raw.user_id,
				raw.code,
				raw.secret_hash,
				raw.email,
				raw.provider,
				raw.provider_user_id,
				raw.expires_at,
			)
			.run();
	}

	public async findById(id: string): Promise<RawAccountLinkProposal[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_link_proposals WHERE id = ?1")
			.bind(id)
			.all<RawAccountLinkProposal>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawAccountLinkProposal[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_link_proposals WHERE user_id = ?1")
			.bind(userId)
			.all<RawAccountLinkProposal>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM account_link_proposals").run();
	}
}
