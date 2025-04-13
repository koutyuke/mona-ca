import type { PasswordResetSession } from "../../domain/entities";
import { newPasswordResetSessionId, newUserId } from "../../domain/value-object";

export type DatabasePasswordResetSession = {
	id: string;
	user_id: string;
	code: string;
	email: string;
	email_verified: 0 | 1;
	expires_at: number;
};

export class PasswordResetSessionTableHelper {
	public basePasswordResetSession = {
		id: newPasswordResetSessionId("passwordResetSessionId"),
		userId: newUserId("userId"),
		code: "testCode",
		email: "test.email@example.com",
		emailVerified: true,
		expiresAt: new Date(1704067200 * 1000),
	} satisfies PasswordResetSession;

	public baseDatabasePasswordResetSession = {
		id: "passwordResetSessionId",
		user_id: "userId",
		code: "testCode",
		email: "test.email@example.com",
		email_verified: 1,
		expires_at: 1704067200,
	} as const satisfies DatabasePasswordResetSession;

	constructor(private readonly db: D1Database) {}

	public async create(passwordResetSession?: DatabasePasswordResetSession): Promise<void> {
		const { id, user_id, code, email, email_verified, expires_at } =
			passwordResetSession ?? this.baseDatabasePasswordResetSession;
		await this.db
			.prepare(
				"INSERT INTO password_reset_sessions (id, user_id, code, email, email_verified, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
			)
			.bind(id, user_id, code, email, email_verified, expires_at)
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
