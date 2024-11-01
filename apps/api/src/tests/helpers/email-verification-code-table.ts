export type DatabaseEmailVerificationCode = {
	id: string;
	email: string;
	user_id: string;
	code: string;
	expires_at: number;
};

export class EmailVerificationCodeTableHelper {
	public baseEmailVerificationCode = {
		id: "emailVerificationCodeId",
		email: "test.email@example.com",
		userId: "userId",
		code: "testCode",
		expiresAt: new Date(1704067200 * 1000),
	} as const;

	public baseDatabaseEmailVerificationCode = {
		id: "emailVerificationCodeId",
		email: "test.email@example.com",
		user_id: "userId",
		code: "testCode",
		expires_at: 1704067200,
	} as const satisfies DatabaseEmailVerificationCode;

	constructor(private readonly db: D1Database) {}

	public async create(emailVerificationCode?: DatabaseEmailVerificationCode): Promise<void> {
		const { id, email, user_id, code, expires_at } = emailVerificationCode ?? this.baseDatabaseEmailVerificationCode;
		await this.db
			.prepare(
				"INSERT INTO email_verification_codes (id, email, user_id, code, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)",
			)
			.bind(id, email, user_id, code, expires_at)
			.run();
	}

	public async find(userId: string): Promise<DatabaseEmailVerificationCode[]> {
		const { results } = await this.db
			.prepare("SELECT * FROM email_verification_codes WHERE user_id = ?1")
			.bind(userId)
			.all<DatabaseEmailVerificationCode>();

		return results;
	}
}
