import { env } from "cloudflare:test";
import { SessionSecretService, createSessionToken } from "../../application/services/session";
import { sessionExpiresSpan } from "../../common/constants";
import type { Session } from "../../domain/entities";
import { newSessionId, newUserId } from "../../domain/value-object";
import { toDatabaseDate } from "../utils";

export type DatabaseSession = {
	id: string;
	user_id: string;
	secret_hash: Array<number>;
	expires_at: number;
};

const { SESSION_PEPPER } = env;

const sessionSecretService = new SessionSecretService(SESSION_PEPPER);

export class SessionTableHelper {
	private readonly expiresAt: Date;

	public baseSession: Session;
	public baseDatabaseSession: DatabaseSession;

	public baseSessionId = "sessionId" as const;
	public baseSessionSecret = "sessionSecret" as const;
	public baseSessionSecretHash = sessionSecretService.hashSessionSecret(this.baseSessionSecret);
	public baseSessionToken = createSessionToken(newSessionId(this.baseSessionId), this.baseSessionSecret);

	constructor(
		private readonly db: D1Database,
		options?: {
			expiresAt?: Date;
		},
	) {
		const { expiresAt = new Date(Date.now() + sessionExpiresSpan.milliseconds()) } = options ?? {};

		this.expiresAt = new Date(toDatabaseDate(expiresAt) * 1000);

		this.baseSession = {
			id: newSessionId(this.baseSessionId),
			userId: newUserId("userId"),
			secretHash: this.baseSessionSecretHash,
			expiresAt: this.expiresAt,
		} satisfies Session;

		this.baseDatabaseSession = {
			id: this.baseSessionId,
			user_id: "userId",
			secret_hash: Array.from(this.baseSessionSecretHash),
			expires_at: this.expiresAt.getTime() / 1000,
		} as const;
	}

	public async create(session?: DatabaseSession): Promise<void> {
		const { id, user_id, secret_hash, expires_at } = session ?? this.baseDatabaseSession;

		await this.db
			.prepare("INSERT INTO sessions (id, user_id, secret_hash, expires_at) VALUES (?1, ?2, ?3, ?4)")
			.bind(id, user_id, secret_hash, expires_at)
			.run();
	}

	public async find(id: string): Promise<DatabaseSession[]> {
		const { results } = await this.db.prepare("SELECT * FROM sessions WHERE id = ?1").bind(id).all<DatabaseSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<DatabaseSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM sessions WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseSession>();

		return results;
	}

	public convertSessionSecretHashToDatabaseSessionSecretHash(sessionSecretHash: Uint8Array): Array<number> {
		return Array.from(sessionSecretHash);
	}
}
