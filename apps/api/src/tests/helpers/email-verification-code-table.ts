import { EmailVerification } from "../../domain/entities";
import { newEmailVerificationId, newUserId } from "../../domain/value-object";

export type DatabaseEmailVerification = {
	id: string;
	email: string;
	user_id: string;
	code: string;
	expires_at: number;
};

export class EmailVerificationTableHelper {
	public baseEmailVerification = new EmailVerification({
		id: newEmailVerificationId("emailVerificationId"),
		email: "test.email@example.com",
		userId: newUserId("userId"),
		code: "testCode",
		expiresAt: new Date(1704067200 * 1000),
	});

	public baseDatabaseEmailVerification = {
		id: "emailVerificationId",
		email: "test.email@example.com",
		user_id: "userId",
		code: "testCode",
		expires_at: 1704067200,
	} as const satisfies DatabaseEmailVerification;

	constructor(private readonly db: D1Database) {}

	public async create(emailVerification?: DatabaseEmailVerification): Promise<void> {
		const { id, email, user_id, code, expires_at } = emailVerification ?? this.baseDatabaseEmailVerification;
		await this.db
			.prepare("INSERT INTO email_verifications (id, email, user_id, code, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)")
			.bind(id, email, user_id, code, expires_at)
			.run();
	}

	public async findById(id: string): Promise<DatabaseEmailVerification[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verifications WHERE id = ?1")
			.bind(id)
			.all<DatabaseEmailVerification>();

		return results;
	}

	public async findByUserId(userId: string): Promise<DatabaseEmailVerification[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verifications WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseEmailVerification>();

		return results;
	}
}
