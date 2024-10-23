import { env } from "cloudflare:test";
import { DrizzleService } from "@/infrastructure/drizzle";
import { beforeAll, describe, expect, test } from "vitest";
import { EmailVerificationCodeRepository } from "../email-verification-code.repository";

const { DB } = env;

describe("Delete Email Verification Expired Code", () => {
	const drizzleService = new DrizzleService(DB);
	const emailVerificationCodeRepository = new EmailVerificationCodeRepository(drizzleService);

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword")
			.run();

		await DB.prepare(
			"INSERT INTO email_verification_codes (id, email, code, user_id, expires_at) VALUES (?1, ?2, ?3, ?4, ?5)",
		)
			.bind("id", "user@mail.com", "code", "userId", new Date(2020, 0, 1).getTime() / 1000)
			.run();
	});

	test("Data is deleted from the database", async () => {
		await emailVerificationCodeRepository.deleteExpiredCodes();

		const { results } = await DB.prepare("SELECT * FROM email_verification_codes WHERE email = ?1")
			.bind("user@mail.com")
			.all();

		expect(results.length).toBe(0);
	});
});
