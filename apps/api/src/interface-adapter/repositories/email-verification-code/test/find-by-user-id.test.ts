import { env } from "cloudflare:test";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { EmailVerificationCodeRepository } from "../email-verification-code.repository";

const { DB } = env;

describe("Find Email Verification Code by User ID", () => {
	const emailVerificationCodeRepository = new EmailVerificationCodeRepository({
		db: DB,
	});

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

	test("Return value is Schema compliant", async () => {
		const foundEmailVerificationCode = await emailVerificationCodeRepository.findByUserId("userId");
		const schema = t.Object({
			id: t.Literal("id1"),
			email: t.Literal("user1@mail.com"),
			code: t.Literal("code1"),
			expiresAt: t.Date(),
			userId: t.Literal("userId"),
		});

		const isValid = Value.Check(schema, foundEmailVerificationCode);
		expect(isValid).toBe(true);
	});

	test("Return value is as expected", async () => {
		const foundEmailVerificationCode = await emailVerificationCodeRepository.findByUserId("invalidUserId");

		expect(foundEmailVerificationCode).toBe(null);
	});
});
