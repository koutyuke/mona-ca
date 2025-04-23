import type { AccountAssociationSession } from "../../domain/entities";
import {
	newAccountAssociationSessionId,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../domain/value-object";
import { toDatabaseDate } from "../utils";

export type DatabaseAccountAssociationSession = {
	id: string;
	user_id: string;
	code: string;
	email: string;
	provider: "discord";
	provider_id: string;
	expires_at: number;
};

export class AccountAssociationSessionTableHelper {
	public baseSession = {
		id: newAccountAssociationSessionId("accountAssociationSessionId"),
		userId: newUserId("userId"),
		code: "testCode",
		email: "test.email@example.com",
		provider: newOAuthProvider("discord"),
		providerId: newOAuthProviderId("123456789"),
		expiresAt: new Date(1704067200 * 1000),
	} as const satisfies AccountAssociationSession;

	public baseDatabaseSession = {
		id: "accountAssociationSessionId",
		user_id: "userId",
		code: "testCode",
		email: "test.email@example.com",
		provider: "discord",
		provider_id: "123456789",
		expires_at: 1704067200,
	} as const satisfies DatabaseAccountAssociationSession;

	constructor(private readonly db: D1Database) {}

	public async create(session?: DatabaseAccountAssociationSession): Promise<void> {
		const { id, user_id, code, email, provider, provider_id, expires_at } = session ?? this.baseDatabaseSession;
		await this.db
			.prepare(
				"INSERT INTO account_association_sessions (id, user_id, code, email, provider, provider_id, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
			)
			.bind(id, user_id, code, email, provider, provider_id, expires_at)
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
			email: session.email,
			provider: newOAuthProvider(session.provider),
			providerId: newOAuthProviderId(session.provider_id),
			expiresAt: new Date(session.expires_at * 1000),
		};
	}
}
