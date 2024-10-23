import { env } from "cloudflare:test";
import { DrizzleService } from "@/infrastructure/drizzle";
import { beforeAll, describe, expect, test } from "vitest";
import { EmailVerificationCodeRepository } from "../email-verification-code.repository";

const { DB } = env;

describe("Delete Email Verification Code", () => {
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
			.bind("id1", "user1@mail.com", "code1", "userId", new Date(2024, 0, 1).getTime() / 1000)
			.run();
	});

	test("Data is deleted from the database", async () => {
		await emailVerificationCodeRepository.delete({
			email: "user1@mail.com",
			userId: "userId",
		});

		const { results } = await DB.prepare("SELECT * FROM email_verification_codes WHERE id = ?1").bind("id1").all();

		expect(results.length).toBe(0);
	});

	test("All data is deleted from the database", async () => {
		await emailVerificationCodeRepository.delete();

		const { results } = await DB.prepare("SELECT * FROM email_verification_codes").all();

		expect(results.length).toBe(0);
	});
});
