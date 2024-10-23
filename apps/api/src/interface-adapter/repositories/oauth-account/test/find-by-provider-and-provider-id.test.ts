import { env } from "cloudflare:test";
import { OAuthAccountSchema } from "@/domain/oauth-account";
import { DrizzleService } from "@/infrastructure/drizzle";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { OAuthAccountRepository } from "../oauth-account.repository";

const { DB } = env;

describe("Find OAuth Account  By Provider And Provider Id", () => {
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
		const foundOAuthAccount = await oAuthAccountRepository.findByProviderAndProviderId("discord", "discordId");
		const isValid = Value.Check(OAuthAccountSchema, foundOAuthAccount);
		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const foundOAuthAccount = await oAuthAccountRepository.findByProviderAndProviderId("discord", "discordId");
		const schema = t.Object({
			provider: t.Literal("discord"),
			providerId: t.Literal("discordId"),
			userId: t.Literal("userId"),
			createdAt: t.Date(),
			updatedAt: t.Date(),
		});
		const isValid = Value.Check(schema, foundOAuthAccount);
		expect(isValid).toBe(true);
	});

	test("間違ったIDを渡した際にnullが返される", async () => {
		const invalidOAuthAccount = await oAuthAccountRepository.findByProviderAndProviderId(
			"invalidProvider" as "discord",
			"invalidProviderId",
		);
		expect(invalidOAuthAccount).toBe(null);
	});
});
