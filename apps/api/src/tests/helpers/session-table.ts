import { env } from "cloudflare:test";
import { SessionTokenService } from "../../application/services/session-token";
import { sessionExpiresSpan } from "../../common/constants";
import type { Session } from "../../domain/entities";
import { newSessionId, newUserId } from "../../domain/value-object";
import { toDatabaseDate } from "../utils";

export type DatabaseSession = {
	id: string;
	user_id: string;
	expires_at: number;
};

const { SESSION_PEPPER } = env;

const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

export class SessionTableHelper {
	private readonly expiresAt: Date;

	public baseSession: Session;
	public baseSessionToken: string = "sessionToken" as const;
	public baseDatabaseSession: DatabaseSession;

	constructor(
		private readonly db: D1Database,
		options?: {
			expiresAt?: Date;
		},
	) {
		const { expiresAt = new Date(Date.now() + sessionExpiresSpan.milliseconds()) } = options ?? {};
		const rawSessionId = sessionTokenService.hashSessionToken(this.baseSessionToken);

		this.expiresAt = new Date(toDatabaseDate(expiresAt) * 1000);

		this.baseSession = {
			id: newSessionId(rawSessionId),
			userId: newUserId("userId"),
			expiresAt: this.expiresAt,
		} satisfies Session;

		this.baseDatabaseSession = {
			id: rawSessionId,
			user_id: "userId",
			expires_at: this.expiresAt.getTime() / 1000,
		} as const;
	}

	public async create(session?: DatabaseSession): Promise<void> {
		const { id, user_id, expires_at } = session ?? this.baseDatabaseSession;

		await this.db
			.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind(id, user_id, expires_at)
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
