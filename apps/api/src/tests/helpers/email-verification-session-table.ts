import type { EmailVerificationSession } from "../../domain/entities";
import { formatSessionToken, newEmailVerificationSessionId, newUserId } from "../../domain/value-object";
import { hashSessionSecret } from "../../infrastructure/crypt";
import { toRawDate, toRawSessionSecretHash } from "./utils";

export type RawEmailVerificationSession = {
	id: string;
	email: string;
	user_id: string;
	code: string;
	secret_hash: Array<number>;
	expires_at: number;
};

export class EmailVerificationSessionTableHelper {
	constructor(private readonly db: D1Database) {}

	public createData(override?: {
		session?: Partial<EmailVerificationSession>;
		sessionSecret?: string;
	}): {
		session: EmailVerificationSession;
		sessionSecret: string;
		sessionToken: string;
	} {
		const sessionSecret = override?.sessionSecret ?? "emailVerificationSessionSecret";
		const secretHash = hashSessionSecret(sessionSecret);

		const session: EmailVerificationSession = {
			id: override?.session?.id ?? newEmailVerificationSessionId("emailVerificationSessionId"),
			email: override?.session?.email ?? "test.email@example.com",
			userId: override?.session?.userId ?? newUserId("userId"),
			code: override?.session?.code ?? "testCode",
			secretHash: override?.session?.secretHash ?? secretHash,
			expiresAt: override?.session?.expiresAt ?? new Date(1704067200 * 1000),
		} satisfies EmailVerificationSession;

		return {
			session,
			sessionSecret,
			sessionToken: formatSessionToken(session.id, sessionSecret),
		};
	}

	public convertToRaw(session: EmailVerificationSession): RawEmailVerificationSession {
		return {
			id: session.id,
			email: session.email,
			user_id: session.userId,
			code: session.code,
			secret_hash: toRawSessionSecretHash(session.secretHash),
			expires_at: toRawDate(session.expiresAt),
		};
	}

	public async save(session: EmailVerificationSession): Promise<void> {
		const raw = this.convertToRaw(session);

		await this.db
			.prepare(
				"INSERT INTO email_verification_sessions (id, email, user_id, code, secret_hash, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
			)
			.bind(raw.id, raw.email, raw.user_id, raw.code, raw.secret_hash, raw.expires_at)
			.run();
	}

	public async findById(id: string): Promise<RawEmailVerificationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verification_sessions WHERE id = ?1")
			.bind(id)
			.all<RawEmailVerificationSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawEmailVerificationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verification_sessions WHERE user_id = ?1")
			.bind(userId)
			.all<RawEmailVerificationSession>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM email_verification_sessions").run();
	}
}
