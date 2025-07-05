import { env } from "cloudflare:test";
import { SessionSecretService, createSessionToken } from "../../application/services/session";
import { sessionExpiresSpan } from "../../common/constants";
import type { Session } from "../../domain/entities";
import { newSessionId, newUserId } from "../../domain/value-object";
import { toDatabaseDate, toDatabaseSessionSecretHash } from "../utils";

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

	public baseData: Session;
	public baseDatabaseData: DatabaseSession;

	public baseId = "sessionId" as const;
	public baseSecret = "sessionSecret" as const;
	public baseSecretHash = sessionSecretService.hashSessionSecret(this.baseSecret);
	public baseToken = createSessionToken(newSessionId(this.baseId), this.baseSecret);

	constructor(
		private readonly db: D1Database,
		options?: {
			expiresAt?: Date;
		},
	) {
		const { expiresAt = new Date(Date.now() + sessionExpiresSpan.milliseconds()) } = options ?? {};

		this.expiresAt = new Date(toDatabaseDate(expiresAt) * 1000);

		this.baseData = {
			id: newSessionId(this.baseId),
			userId: newUserId("userId"),
			secretHash: this.baseSecretHash,
			expiresAt: this.expiresAt,
		} satisfies Session;

		this.baseDatabaseData = {
			id: this.baseId,
			user_id: "userId",
			secret_hash: toDatabaseSessionSecretHash(this.baseSecretHash),
			expires_at: this.expiresAt.getTime() / 1000,
		} as const;
	}

	public async create(session?: DatabaseSession): Promise<void> {
		const { id, user_id, secret_hash, expires_at } = session ?? this.baseDatabaseData;

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
}
