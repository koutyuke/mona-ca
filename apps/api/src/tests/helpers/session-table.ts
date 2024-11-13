import { env } from "cloudflare:test";
import { sessionExpiresSpan } from "../../common/constants";
import { SessionTokenService } from "../../services/session-token";

export type DatabaseSession = {
	id: string;
	user_id: string;
	expires_at: number;
};

const { SESSION_PEPPER } = env;

const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

export class SessionTableHelper {
	private readonly expiresAt: Date;

	public baseSessionToken = "sessionToken" as const;
	public baseSession;
	public baseDatabaseSession;

	constructor(
		private readonly db: D1Database,
		options?: {
			expiresAt: Date;
		},
	) {
		const { expiresAt = new Date(Date.now() + sessionExpiresSpan.milliseconds()) } = options ?? {};

		this.expiresAt = new Date(((expiresAt.getTime() / 1000) | 0) * 1000);

		this.baseSession = {
			id: sessionTokenService.hashSessionToken(this.baseSessionToken),
			userId: "userId",
			expiresAt: this.expiresAt,
		} as const;

		this.baseDatabaseSession = {
			id: sessionTokenService.hashSessionToken(this.baseSessionToken),
			user_id: "userId",
			expires_at: this.expiresAt.getTime() / 1000,
		} as const satisfies DatabaseSession;
	}

	public async create(option?: {
		sessionToken?: string;
		session?: Partial<Omit<DatabaseSession, "id">>;
	}): Promise<void> {
		const { sessionToken, session } = option ?? {};
		const { user_id = this.baseDatabaseSession.user_id, expires_at = this.baseDatabaseSession.expires_at } =
			session ?? this.baseDatabaseSession;

		const id = sessionToken ? sessionTokenService.hashSessionToken(sessionToken) : this.baseSession.id;

		await this.db
			.prepare("INSERT INTO session (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind(id, user_id, expires_at)
			.run();
	}

	public async find(id: string): Promise<DatabaseSession[]> {
		const { results } = await this.db.prepare("SELECT * FROM session WHERE id = ?1").bind(id).all<DatabaseSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<DatabaseSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM session WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseSession>();

		return results;
	}
}
