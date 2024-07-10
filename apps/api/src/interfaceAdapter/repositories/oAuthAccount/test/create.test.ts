import { env } from "cloudflare:test";
import { OAuthAccountSchema } from "@/domain/oAuthAccount";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { OAuthAccountRepository } from "../oAuthAccount.repository";

const { DB } = env;

describe("Create OAuth Account", () => {
	const oAuthAccountRepository = new OAuthAccountRepository({
		db: DB,
	});

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword")
			.run();
	});

	test("返り値がSchema通りである(OAuthAccountSchema)", async () => {
		const createdOAuthAccount = await oAuthAccountRepository.create({
			provider: "discord",
			providerId: "discordId",
			userId: "userId",
		});
		const isValid = Value.Check(OAuthAccountSchema, createdOAuthAccount);
		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const createdOAuthAccount = await oAuthAccountRepository.create({
			provider: "discord",
			providerId: "discordId",
			userId: "userId",
		});

		const schema = t.Object({
			provider: t.Literal("discord"),
			providerId: t.Literal("discordId"),
			userId: t.Literal("userId"),
			createdAt: t.Date(),
			updatedAt: t.Date(),
		});
		const isValid = Value.Check(schema, createdOAuthAccount);
		expect(isValid).toBe(true);
	});

	test("DBにデータが保存されている", async () => {
		await oAuthAccountRepository.create({
			provider: "discord",
			providerId: "discordId",
			userId: "userId",
		});

		const { results } = await DB.prepare(
			"SELECT * FROM oauth_accounts WHERE provider = ?1 AND provider_id = ?2 AND user_id = ?3",
		)
			.bind("discord", "discordId", "userId")
			.all();

		const schema = t.Object(
			{
				provider: t.Literal("discord"),
				provider_id: t.Literal("discordId"),
				user_id: t.Literal("userId"),
				created_at: t.Number(),
				updated_at: t.Number(),
			},
			{ additionalProperties: false },
		);

		const isValid = Value.Check(schema, results[0]);

		expect(results.length).toBe(1);
		expect(isValid).toBe(true);
	});
});
