import { env } from "cloudflare:test";
import { DrizzleService } from "@/infrastructure/drizzle";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { EmailVerificationCodeRepository } from "../email-verification-code.repository";

const { DB } = env;

describe("Create Email Verification Code", () => {
	const drizzleService = new DrizzleService(DB);
	const emailVerificationCodeRepository = new EmailVerificationCodeRepository(drizzleService);

	const schema = t.Object({
		id: t.Literal("id"),
		email: t.Literal("user@mail.com"),
		code: t.Literal("code"),
		userId: t.Literal("userId"),
		expiresAt: t.Date(),
	});

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword")
			.run();
	});

	test("Return value is Schema compliant", async () => {
		const createdEmailVerificationCode = await emailVerificationCodeRepository.create({
			id: "id",
			email: "user@mail.com",
			code: "code",
			userId: "userId",
			expiresAt: new Date(2024, 0, 1),
		});

		expect(createdEmailVerificationCode.isExpired).toBe(true);
		expect(Value.Check(schema, createdEmailVerificationCode)).toBe(true);
	});

	test("Data is saved in the database", async () => {
		await emailVerificationCodeRepository.create({
			id: "id",
			email: "user@mail.com",
			code: "code",
			userId: "userId",
			expiresAt: new Date(2024, 0, 1),
		});

		const dbSchema = t.Object({
			id: t.Literal("id"),
			email: t.Literal("user@mail.com"),
			code: t.Literal("code"),
			user_id: t.Literal("userId"),
			expires_at: t.Number(),
		});

		const { results } = await DB.prepare("SELECT * FROM email_verification_codes WHERE id = ?1").bind("id").all();

		expect(results.length).toBe(1);
		expect(Value.Check(dbSchema, results[0])).toBe(true);
	});
});
