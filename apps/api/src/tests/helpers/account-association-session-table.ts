import { type ToPrimitive, ulid } from "../../common/utils";
import { type AccountAssociationSession, accountAssociationSessionExpiresSpan } from "../../domain/entities";
import {
	formatSessionToken,
	newAccountAssociationSessionId,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../domain/value-object";
import type { OAuthProvider } from "../../domain/value-object";
import { hashSessionSecret } from "../../infrastructure/crypt";
import { toRawDate, toRawSessionSecretHash } from "./utils";

export type RawAccountAssociationSession = {
	id: string;
	user_id: string;
	code: string | null;
	secret_hash: Array<number>;
	email: string;
	provider: ToPrimitive<OAuthProvider>;
	provider_id: string;
	expires_at: number;
};

export class AccountAssociationSessionTableHelper {
	constructor(private readonly db: D1Database) {}

	public createData(override?: {
		session?: Partial<AccountAssociationSession>;
		sessionSecret?: string;
	}): {
		session: AccountAssociationSession;
		sessionSecret: string;
		sessionToken: string;
	} {
		const sessionSecret = override?.sessionSecret ?? "accountAssociationSessionSecret";
		const secretHash = hashSessionSecret(sessionSecret);

		const session: AccountAssociationSession = {
			id: override?.session?.id ?? newAccountAssociationSessionId(ulid()),
			userId: override?.session?.userId ?? newUserId(ulid()),
			code: override?.session?.code ?? "testCode",
			secretHash: override?.session?.secretHash ?? secretHash,
			email: override?.session?.email ?? "test.email@example.com",
			provider: override?.session?.provider ?? newOAuthProvider("discord"),
			providerId: override?.session?.providerId ?? newOAuthProviderId(ulid()),
			expiresAt:
				override?.session?.expiresAt ?? new Date(Date.now() + accountAssociationSessionExpiresSpan.milliseconds()),
		} satisfies AccountAssociationSession;

		const sessionToken = formatSessionToken(session.id, sessionSecret);

		return {
			session,
			sessionSecret,
			sessionToken,
		};
	}

	public async save(session: AccountAssociationSession): Promise<void> {
		const raw = this.convertToRaw(session);

		await this.db
			.prepare(
				"INSERT INTO account_association_sessions (id, user_id, code, secret_hash, email, provider, provider_id, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
			)
			.bind(raw.id, raw.user_id, raw.code, raw.secret_hash, raw.email, raw.provider, raw.provider_id, raw.expires_at)
			.run();
	}

	public async findById(id: string): Promise<RawAccountAssociationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_association_sessions WHERE id = ?1")
			.bind(id)
			.all<RawAccountAssociationSession>();

		return results;
	}

	public async findByUserId(userId: string): Promise<RawAccountAssociationSession[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM account_association_sessions WHERE user_id = ?1")
			.bind(userId)
			.all<RawAccountAssociationSession>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM account_association_sessions").run();
	}

	public convertToRaw(session: AccountAssociationSession): RawAccountAssociationSession {
		return {
			id: session.id,
			user_id: session.userId,
			code: session.code,
			secret_hash: toRawSessionSecretHash(session.secretHash),
			email: session.email,
			provider: session.provider,
			provider_id: session.providerId,
			expires_at: toRawDate(session.expiresAt),
		};
	}
}
