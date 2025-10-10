import type { Session } from "../../domain/entities";
import { toRawDate, toRawSessionSecretHash } from "./utils";

export type RawSession = {
	id: string;
	user_id: string;
	secret_hash: Array<number>;
	expires_at: number;
};

export class SessionTableHelper {
	constructor(private readonly db: D1Database) {}

	public convertToRaw(session: Session): RawSession {
		return {
			id: session.id,
			user_id: session.userId,
			secret_hash: toRawSessionSecretHash(session.secretHash),
			expires_at: toRawDate(session.expiresAt),
		};
	}

	public async save(session: Session): Promise<void> {
		const raw = this.convertToRaw(session);

		await this.db
			.prepare("INSERT INTO sessions (id, user_id, secret_hash, expires_at) VALUES (?1, ?2, ?3, ?4)")
			.bind(raw.id, raw.user_id, raw.secret_hash, raw.expires_at)
			.run();
	}

	public async find(id: string): Promise<RawSession[]> {
		const { results } = await this.db.prepare("SELECT * FROM sessions WHERE id = ?1").bind(id).all<RawSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM sessions WHERE user_id = ?1")
			.bind(userId)
			.all<RawSession>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM sessions").run();
	}
}
