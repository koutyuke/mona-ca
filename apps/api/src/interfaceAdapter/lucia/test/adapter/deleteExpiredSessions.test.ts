import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { LuciaAdapter } from "../../lucia.adapter";

const { DB } = env;

describe("Delete Expired Sessions", () => {
	let luciaAdapter: LuciaAdapter;

	beforeAll(async () => {
		luciaAdapter = new LuciaAdapter({ db: DB });

		const expiredAt = new Date();
		expiredAt.setHours(expiredAt.getHours() - 1);

		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword", Date.now(), Date.now())
			.run();

		await DB.prepare("INSERT INTO session (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind("sessionId", "userId", (expiredAt.getTime() / 1000) | 0)
			.run();
	});

	test("期限切れのセッションが正常に削除される", async () => {
		await luciaAdapter.deleteExpiredSessions();

		const { results } = await DB.prepare("SELECT * FROM session WHERE id = ?1").bind("sessionId").all();
		expect(results.length).toBe(0);
	});
});
