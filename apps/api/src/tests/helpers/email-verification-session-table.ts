import type { EmailVerificationSession } from "../../domain/entities";
import { newEmailVerificationSessionId, newUserId } from "../../domain/value-object";

export type DatabaseEmailVerificationSession = {
	id: string;
	email: string;
	user_id: string;
	code: string;
	expires_at: number;
};

export class EmailVerificationSessionTableHelper {
	public baseEmailVerificationSession = {
		id: newEmailVerificationSessionId("emailVerificationSessionId"),
		email: "test.email@example.com",
		userId: newUserId("userId"),
		code: "testCode",
		expiresAt: new Date(1704067200 * 1000),
	} satisfies EmailVerificationSession;

	public baseDatabaseEmailVerificationSession = {
		id: "emailVerificationSessionId",
		email: "test.email@example.com",
		user_id: "userId",
		code: "testCode",
		expires_at: 1704067200,
	} as const satisfies DatabaseEmailVerificationSession;

	constructor(private readonly db: D1Database) {}

	public async create(emailVerificationSession?: DatabaseEmailVerificationSession): Promise<void> {
		const { id, email, user_id, code, expires_at } =
			emailVerificationSession ?? this.baseDatabaseEmailVerificationSession;
		await this.db
			.prepare(
				"INSERT INTO email_verification_sessions (id, email, user_id, code, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)",
			)
			.bind(id, email, user_id, code, expires_at)
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
