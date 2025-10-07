import { env } from "cloudflare:test";
import { SessionSecretService, createSessionToken } from "../../application/services/session";
import { ulid } from "../../common/utils";
import type { SignupSession } from "../../domain/entities";
import { newSignupSessionId } from "../../domain/value-object";
import { toDatabaseDate, toDatabaseSessionSecretHash } from "../utils";

export type RawSignupSession = {
	id: string;
	email: string;
	email_verified: 0 | 1;
	code: string;
	secret_hash: Array<number>;
	expires_at: number;
};

const { SIGNUP_SESSION_PEPPER } = env;

const sessionSecretService = new SessionSecretService(SIGNUP_SESSION_PEPPER);

export class SignupSessionTableHelper {
	constructor(private readonly db: D1Database) {}

	public createData(override?: {
		signupSession?: Partial<SignupSession>;
		signupSessionSecret?: string;
	}): {
		signupSession: SignupSession;
		signupSessionSecret: string;
		signupSessionToken: string;
	} {
		const secret = override?.signupSessionSecret ?? "signupSessionSecret";
		const secretHash = sessionSecretService.hashSessionSecret(secret);

		return {
			signupSession: {
				id: newSignupSessionId(ulid()),
				email: "test@example.com",
				emailVerified: false,
				code: "testCode",
				secretHash: secretHash,
				expiresAt: new Date(1704067200 * 1000),
			},
			signupSessionSecret: secret,
			signupSessionToken: createSessionToken(newSignupSessionId(ulid()), secret),
		};
	}

	public convertToRaw(signupSession: SignupSession): RawSignupSession {
		return {
			id: signupSession.id,
			email: signupSession.email,
			email_verified: signupSession.emailVerified ? 1 : 0,
			code: signupSession.code,
			secret_hash: toDatabaseSessionSecretHash(signupSession.secretHash),
			expires_at: toDatabaseDate(signupSession.expiresAt),
		};
	}

	public async save(signupSession: SignupSession): Promise<void> {
		const raw = this.convertToRaw(signupSession);
		await this.db
			.prepare(
				"INSERT INTO signup_sessions (id, email, email_verified, code, secret_hash, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
			)
			.bind(raw.id, raw.email, raw.email_verified, raw.code, raw.secret_hash, raw.expires_at)
			.run();
	}

	public async findById(id: string): Promise<RawSignupSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM signup_sessions WHERE id = ?1")
			.bind(id)
			.all<RawSignupSession>();
		return results;
	}

	public async findByEmail(email: string): Promise<RawSignupSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM signup_sessions WHERE email = ?1")
			.bind(email)
			.all<RawSignupSession>();
		return results;
	}

	public async deleteById(id: string): Promise<void> {
		await this.db.prepare("DELETE FROM signup_sessions WHERE id = ?1").bind(id).run();
	}
}
