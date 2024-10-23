import { env } from "cloudflare:test";
import { OAuthAccountSchema } from "@/domain/oauth-account";
import { DrizzleService } from "@/infrastructure/drizzle";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

describe("Update OAuth Account By User Id", () => {
	const drizzleService = new DrizzleService(DB);
	const oAuthAccountRepository = new OAuthAccountRepository(drizzleService);

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword")
			.run();

		await DB.prepare("INSERT INTO oauth_accounts (provider, provider_id, user_id) VALUES (?1, ?2, ?3)")
			.bind("discord", "discordId", "userId")
			.run();
	});

	test("返り値がSchema通りである(OAuthAccountSchema)", async () => {
		const updatedOAuthAccount = await oAuthAccountRepository.updateByUserId("userId", {
			provider: "discord",
			providerId: "updatedDiscordId",
		});
		const isValid = Value.Check(OAuthAccountSchema, updatedOAuthAccount);
		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const updatedOAuthAccount = await oAuthAccountRepository.updateByUserId("userId", {
			provider: "discord",
			providerId: "updatedDiscordId",
		});
		const schema = t.Object({
			provider: t.Literal("discord"),
			providerId: t.Literal("updatedDiscordId"),
			userId: t.Literal("userId"),
			createdAt: t.Date(),
			updatedAt: t.Date(),
		});
		const isValid = Value.Check(schema, updatedOAuthAccount);
		expect(isValid).toBe(true);
	});

	test("DBにデータが更新されている", async () => {
		await oAuthAccountRepository.updateByUserId("userId", {
			provider: "discord",
			providerId: "updatedDiscordId",
		});

		const { results } = await DB.prepare(
			"SELECT * FROM oauth_accounts WHERE provider = ?1 AND provider_id = ?2 AND user_id = ?3",
		)
			.bind("discord", "updatedDiscordId", "userId")
			.all();

		const schema = t.Object(
			{
				provider: t.Literal("discord"),
				provider_id: t.Literal("updatedDiscordId"),
				user_id: t.Literal("userId"),
				created_at: t.Number(),
				updated_at: t.Number(),
			},
			{ additionalProperties: false },
		);
		expect(results.length).toBe(1);
		expect(Value.Check(schema, results[0])).toBe(true);
	});
});
