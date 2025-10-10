import type { PasswordResetSession } from "../../domain/entities";
import { formatSessionToken, newPasswordResetSessionId, newUserId } from "../../domain/value-object";
import { hashSessionSecret } from "../../infrastructure/crypt";
import { toRawBoolean, toRawDate, toRawSessionSecretHash } from "./utils";

export type RawPasswordResetSession = {
	id: string;
	user_id: string;
	code: string;
	secret_hash: Array<number>;
	email: string;
	email_verified: 0 | 1;
	expires_at: number;
};

export class PasswordResetSessionTableHelper {
	constructor(private readonly db: D1Database) {}

	public createData(override?: {
		session?: Partial<PasswordResetSession>;
		sessionSecret?: string;
	}): {
		session: PasswordResetSession;
		sessionSecret: string;
		sessionToken: string;
	} {
		const sessionSecret = override?.sessionSecret ?? "passwordResetSessionSecret";
		const secretHash = hashSessionSecret(sessionSecret);

		const session: PasswordResetSession = {
			id: override?.session?.id ?? newPasswordResetSessionId("passwordResetSessionId"),
			userId: override?.session?.userId ?? newUserId("userId"),
			code: override?.session?.code ?? "testCode",
			secretHash: override?.session?.secretHash ?? secretHash,
			email: override?.session?.email ?? "test.email@example.com",
			emailVerified: override?.session?.emailVerified ?? true,
			expiresAt: override?.session?.expiresAt ?? new Date(1704067200 * 1000),
		} satisfies PasswordResetSession;

		return {
			session,
			sessionSecret,
			sessionToken: formatSessionToken(session.id, sessionSecret),
		};
	}

	public convertToRaw(session: PasswordResetSession): RawPasswordResetSession {
		return {
			id: session.id,
			user_id: session.userId,
			code: session.code,
			secret_hash: toRawSessionSecretHash(session.secretHash),
			email: session.email,
			email_verified: toRawBoolean(session.emailVerified),
			expires_at: toRawDate(session.expiresAt),
		};
	}

	public async save(session: PasswordResetSession): Promise<void> {
		const raw = this.convertToRaw(session);

		await this.db
			.prepare(
				"INSERT INTO password_reset_sessions (id, user_id, code, secret_hash, email, email_verified, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
			)
			.bind(raw.id, raw.user_id, raw.code, raw.secret_hash, raw.email, raw.email_verified, raw.expires_at)
			.run();
	}

	public async findById(id: string): Promise<RawPasswordResetSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM password_reset_sessions WHERE id = ?1")
			.bind(id)
			.all<RawPasswordResetSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawPasswordResetSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM password_reset_sessions WHERE user_id = ?1")
			.bind(userId)
			.all<RawPasswordResetSession>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM password_reset_sessions").run();
	}
}
