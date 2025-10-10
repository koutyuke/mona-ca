import { ulid } from "../../common/utils";
import { type Session, sessionExpiresSpan } from "../../domain/entities";
import { formatSessionToken, newSessionId, newUserId } from "../../domain/value-object";
import { hashSessionSecret } from "../../infrastructure/crypt";
import { toRawDate, toRawSessionSecretHash } from "./utils";

export type RawSession = {
	id: string;
	user_id: string;
	secret_hash: Array<number>;
	expires_at: number;
};

export class SessionTableHelper {
	constructor(private readonly db: D1Database) {}

	public createData(override?: {
		session?: Partial<Session>;
		sessionSecret?: string;
	}): {
		session: Session;
		sessionSecret: string;
		sessionToken: string;
	} {
		const sessionSecret = override?.sessionSecret ?? "sessionSecret";
		const secretHash = hashSessionSecret(sessionSecret);

		const session: Session = {
			id: override?.session?.id ?? newSessionId(ulid()),
			userId: override?.session?.userId ?? newUserId(ulid()),
			secretHash: override?.session?.secretHash ?? secretHash,
			expiresAt:
				override?.session?.expiresAt ??
				new Date(
					toRawDate(override?.session?.expiresAt ?? new Date(Date.now() + sessionExpiresSpan.milliseconds())) * 1000,
				),
		} satisfies Session;

		return {
			session,
			sessionSecret,
			sessionToken: formatSessionToken(session.id, sessionSecret),
		};
	}

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
