import { env } from "cloudflare:test";
import { SessionSecretService, createSessionToken } from "../../application/services/session";
import type { AccountAssociationSession } from "../../domain/entities";
import {
	newAccountAssociationSessionId,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../domain/value-object";
import { toDatabaseDate, toDatabaseSessionSecretHash } from "../utils";

export type DatabaseAccountAssociationSession = {
	id: string;
	user_id: string;
	code: string | null;
	secret_hash: Array<number>;
	email: string;
	provider: "discord";
	provider_id: string;
	expires_at: number;
};

const { ACCOUNT_ASSOCIATION_SESSION_PEPPER } = env;

const sessionSecretService = new SessionSecretService(ACCOUNT_ASSOCIATION_SESSION_PEPPER);

export class AccountAssociationSessionTableHelper {
	public baseId = "accountAssociationSessionId" as const;
	public baseSecret = "accountAssociationSessionSecret" as const;
	public baseSecretHash = sessionSecretService.hashSessionSecret(this.baseSecret);
	public baseToken = createSessionToken(newAccountAssociationSessionId(this.baseId), this.baseSecret);

	public baseData = {
		id: newAccountAssociationSessionId(this.baseId),
		userId: newUserId("userId"),
		code: "testCode",
		secretHash: this.baseSecretHash,
		email: "test.email@example.com",
		provider: newOAuthProvider("discord"),
		providerId: newOAuthProviderId("123456789"),
		expiresAt: new Date(1704067200 * 1000),
	} as const satisfies AccountAssociationSession;

	public baseDatabaseData = {
		id: this.baseId,
		user_id: "userId",
		code: "testCode",
		secret_hash: toDatabaseSessionSecretHash(this.baseSecretHash),
		email: "test.email@example.com",
		provider: "discord",
		provider_id: "123456789",
		expires_at: 1704067200,
	} as const satisfies DatabaseAccountAssociationSession;

	constructor(private readonly db: D1Database) {}

	public async create(session?: DatabaseAccountAssociationSession): Promise<void> {
		const { id, user_id, code, secret_hash, email, provider, provider_id, expires_at } =
			session ?? this.baseDatabaseData;
		await this.db
			.prepare(
				"INSERT INTO account_association_sessions (id, user_id, code, secret_hash, email, provider, provider_id, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
			)
			.bind(id, user_id, code, secret_hash, email, provider, provider_id, expires_at)
			.run();
	}

	public async findById(id: string): Promise<DatabaseAccountAssociationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_association_sessions WHERE id = ?1")
			.bind(id)
			.all<DatabaseAccountAssociationSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<DatabaseAccountAssociationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_association_sessions WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseAccountAssociationSession>();

		return results;
	}

	public toDatabaseSession(session: AccountAssociationSession): DatabaseAccountAssociationSession {
		return {
			id: session.id,
			user_id: session.userId,
			code: session.code,
			secret_hash: toDatabaseSessionSecretHash(session.secretHash),
			email: session.email,
			provider: session.provider,
			provider_id: session.providerId,
			expires_at: toDatabaseDate(session.expiresAt),
		};
	}

	public toSession(session: DatabaseAccountAssociationSession): AccountAssociationSession {
		return {
			id: newAccountAssociationSessionId(session.id),
			userId: newUserId(session.user_id),
			code: session.code,
			secretHash: new Uint8Array(session.secret_hash),
			email: session.email,
			provider: newOAuthProvider(session.provider),
			providerId: newOAuthProviderId(session.provider_id),
			expiresAt: new Date(session.expires_at * 1000),
		};
	}
}
