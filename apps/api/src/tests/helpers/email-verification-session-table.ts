import { env } from "cloudflare:test";
import { SessionSecretService, createSessionToken } from "../../application/services/session";
import type { EmailVerificationSession } from "../../domain/entities";
import { newEmailVerificationSessionId, newUserId } from "../../domain/value-object";
import { toDatabaseSessionSecretHash } from "../utils";

export type DatabaseEmailVerificationSession = {
	id: string;
	email: string;
	user_id: string;
	code: string;
	secret_hash: Array<number>;
	expires_at: number;
};

const { EMAIL_VERIFICATION_SESSION_PEPPER } = env;

const sessionSecretService = new SessionSecretService(EMAIL_VERIFICATION_SESSION_PEPPER);

export class EmailVerificationSessionTableHelper {
	public baseId = "emailVerificationSessionId" as const;
	public baseSecret = "emailVerificationSessionSecret" as const;
	public baseSecretHash = sessionSecretService.hashSessionSecret(this.baseSecret);
	public baseToken = createSessionToken(newEmailVerificationSessionId(this.baseId), this.baseSecret);

	public baseData = {
		id: newEmailVerificationSessionId(this.baseId),
		email: "test.email@example.com",
		userId: newUserId("userId"),
		code: "testCode",
		secretHash: this.baseSecretHash,
		expiresAt: new Date(1704067200 * 1000),
	} satisfies EmailVerificationSession;

	public baseDatabaseData = {
		id: "emailVerificationSessionId",
		email: "test.email@example.com",
		user_id: "userId",
		code: "testCode",
		secret_hash: toDatabaseSessionSecretHash(this.baseSecretHash),
		expires_at: 1704067200,
	} as const satisfies DatabaseEmailVerificationSession;

	constructor(private readonly db: D1Database) {}

	public async create(emailVerificationSession?: DatabaseEmailVerificationSession): Promise<void> {
		const { id, email, user_id, code, secret_hash, expires_at } = emailVerificationSession ?? this.baseDatabaseData;

		await this.db
			.prepare(
				"INSERT INTO email_verification_sessions (id, email, user_id, code, secret_hash, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
			)
			.bind(id, email, user_id, code, secret_hash, expires_at)
			.run();
	}

	public async findById(id: string): Promise<DatabaseEmailVerificationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verification_sessions WHERE id = ?1")
			.bind(id)
			.all<DatabaseEmailVerificationSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<DatabaseEmailVerificationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verification_sessions WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseEmailVerificationSession>();

		return results;
	}
}
