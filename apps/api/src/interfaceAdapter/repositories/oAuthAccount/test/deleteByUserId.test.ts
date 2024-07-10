import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { OAuthAccountRepository } from "../oAuthAccount.repository";

const { DB } = env;

describe("Delete OAuth Account By User Id", () => {
	const oAuthAccountRepository = new OAuthAccountRepository({
		db: DB,
	});

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

	test("DBからデータが削除されている", async () => {
		await oAuthAccountRepository.deleteByUserId("userId", "discord");
		const { results } = await DB.prepare("SELECT * FROM oauth_accounts WHERE user_id = ?1").bind("userId").all();
		expect(results.length).toBe(0);
	});
});
