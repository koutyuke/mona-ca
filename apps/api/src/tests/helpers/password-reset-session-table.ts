import { env } from "cloudflare:test";
import { SessionSecretService, createSessionToken } from "../../application/services/session";
import type { PasswordResetSession } from "../../domain/entities";
import { newPasswordResetSessionId, newUserId } from "../../domain/value-object";
import { toDatabaseSessionSecretHash } from "../utils";

export type DatabasePasswordResetSession = {
	id: string;
	user_id: string;
	code: string;
	secret_hash: Array<number>;
	email: string;
	email_verified: 0 | 1;
	expires_at: number;
};

const { PASSWORD_RESET_SESSION_PEPPER } = env;

const sessionSecretService = new SessionSecretService(PASSWORD_RESET_SESSION_PEPPER);

export class PasswordResetSessionTableHelper {
	public baseId = "passwordResetSessionId" as const;
	public baseSecret = "passwordResetSessionSecret" as const;
	public baseSecretHash = sessionSecretService.hashSessionSecret(this.baseSecret);
	public baseToken = createSessionToken(newPasswordResetSessionId(this.baseId), this.baseSecret);

	public baseData = {
		id: newPasswordResetSessionId(this.baseId),
		userId: newUserId("userId"),
		code: "testCode",
		secretHash: this.baseSecretHash,
		email: "test.email@example.com",
		emailVerified: true,
		expiresAt: new Date(1704067200 * 1000),
	} satisfies PasswordResetSession;

	public baseDatabaseData = {
		id: this.baseId,
		user_id: "userId",
		code: "testCode",
		secret_hash: toDatabaseSessionSecretHash(this.baseSecretHash),
		email: "test.email@example.com",
		email_verified: 1,
		expires_at: 1704067200,
	} as const satisfies DatabasePasswordResetSession;

	constructor(private readonly db: D1Database) {}

	public async create(passwordResetSession?: DatabasePasswordResetSession): Promise<void> {
		const { id, user_id, code, secret_hash, email, email_verified, expires_at } =
			passwordResetSession ?? this.baseDatabaseData;
		await this.db
			.prepare(
				"INSERT INTO password_reset_sessions (id, user_id, code, secret_hash, email, email_verified, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
			)
			.bind(id, user_id, code, secret_hash, email, email_verified, expires_at)
			.run();
	}

	public async findById(id: string): Promise<DatabasePasswordResetSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM password_reset_sessions WHERE id = ?1")
			.bind(id)
			.all<DatabasePasswordResetSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<DatabasePasswordResetSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM password_reset_sessions WHERE user_id = ?1")
			.bind(userId)
			.all<DatabasePasswordResetSession>();

		return results;
	}
}
