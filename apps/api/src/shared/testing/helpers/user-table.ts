export type RawUser = {
	id: string;
	name: string;
	email: string;
	email_verified: 0 | 1;
	icon_url: string | null;
	gender: "man" | "woman";
	password_hash: string | null;
	created_at: number;
	updated_at: number;
};

export class UserTableHelper {
	constructor(private readonly db: D1Database) {}

	public async save(raw: RawUser): Promise<void> {
		await this.db
			.prepare(
				"INSERT INTO users (id, name, email, email_verified, icon_url, gender, password_hash, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
			)
			.bind(
				raw.id,
				raw.name,
				raw.email,
				raw.email_verified,
				raw.icon_url,
				raw.gender,
				raw.password_hash,
				raw.created_at,
				raw.updated_at,
			)
			.run();
	}

	public async findById(id: string): Promise<RawUser[]> {
		const { results } = await this.db.prepare("SELECT * FROM users WHERE id = ?1").bind(id).all<RawUser>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM users").run();
	}
}
