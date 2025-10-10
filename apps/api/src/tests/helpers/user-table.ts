import type { User } from "../../domain/entities";
import { toRawBoolean, toRawDate } from "./utils";

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

	public convertToRaw(user: User, passwordHash: string | null): RawUser {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			email_verified: toRawBoolean(user.emailVerified),
			icon_url: user.iconUrl,
			gender: user.gender,
			password_hash: passwordHash,
			created_at: toRawDate(user.createdAt),
			updated_at: toRawDate(user.updatedAt),
		};
	}

	public async save(user: User, passwordHash: string | null): Promise<void> {
		const { id, name, email, email_verified, icon_url, gender, created_at, updated_at, password_hash } =
			this.convertToRaw(user, passwordHash);

		await this.db
			.prepare(
				"INSERT INTO users (id, name, email, email_verified, icon_url, gender, password_hash, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
			)
			.bind(id, name, email, email_verified, icon_url, gender, password_hash, created_at, updated_at)
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
